# CMPT Verification Report & Finalized Protocol

**Paper:** *Capability-Mapped Phase Training (CMPT): Aligning LoRA Adapter Modules to Agent Behavior Boundaries* — Luis M. Minier (June 2026)
**Stack:** CMPT (training provenance) + SmartWeights (deployment packaging, Zenodo 19981077) + AACP (runtime security, Zenodo 20274021)
**Reference implementation:** `LMMinier/ELDRAE-` → `smartweights/packs/eldrae-core/`
**Supporting infra:** `LMMinier/quantoniumos` (RFTMW/RFT engine, 494 files — backs the reserved `rft_space` namespace)
**Verified:** 2026-06-17

---

## 1. What was verified (PASS)

| Claim in paper | Source of truth | Result |
|---|---|---|
| Module→phase mapping (q/v, k/o, gate, up, down, all) | safetensors tensor keys | **EXACT MATCH** |
| 6 disjoint phases + combined | `smartweight.json` `phases[]` + adapters | **PASS** (phases target disjoint modules) |
| Per-phase artifact SHA-256 + byte counts | recomputed `sha256sum` vs manifest | **10/10 present artifacts MATCH** |
| Artifact sizes 7 MB / 14 MB / 57 MB | `ls` on real files | **MATCH** (7,391,728 / 15,049,888 / 59,933,632 B) |
| Combined adapter 57 MB, all modules, rank 16 | safetensors header | **MATCH** (59,934,104 B, rank 16, 504 tensors) |
| 21-domain corpus | `corpus/*.json` | **MATCH** (21 files + index) |
| Self-distillation: 25 entries, avg quality 0.64 | `knowledge_pack.json` `stats` | **MATCH** (total_entries 25, avg_quality 0.644) |
| Distillation domains (identity, quantoniumos/OS, tools, conversation, coding) | `knowledge_pack.json` | **MATCH** |
| Trust classes (trusted_policy_overlay vs untrusted_knowledge_snapshot) + 3 AACP rules | `smartweight.json` `safety.trust_classes` | **MATCH** (verbatim rules present) |
| Safety block (base_weight_mutation forbidden, overlay load, off-by-default network, etc.) | `smartweight.json` `safety` | **MATCH** |
| Frozen base never modified | adapters are LoRA deltas only | **PASS** |
| `rft_space` reserved, internals not disclosed | per-phase manifests carry `rft_space`; QOS holds RFT code | **PASS** (namespace real, math not in CMPT) |

**Hash binding works end-to-end.** Every adapter, the JSONL, and the system-prompt overlay present in the repo hash exactly to the manifest. The 3 not-present entries (`base_gguf` 1.8 GB, `combined_lora_gguf`, `phase_corpus_gguf`) are the large binaries excluded from git — expected.

---

## 2. Discrepancies found (paper vs. shipped artifacts)

These do **not** break the methodology, but the **numeric tables in the paper do not match the real adapters** and should be corrected before this is the "final" version.

### 2.1 Layer count — paper says 28, artifacts have 36
Every adapter spans `layers.0`–`layers.35` (**36 transformer layers**, consistent with Qwen2.5‑Coder‑3B). Paper Table V ("28 transformer layers") and all derived per-phase parameter totals are computed on the wrong layer count.

### 2.2 Rank — paper says rank 16 for phases; phase adapters are rank 8
- Phase 1–5 and `phase_corpus` safetensors: **rank 8** (lora_A `[8, …]`).
- Only `eldrae_combined`: **rank 16**.
- The v2 `smartweight.json` `lora.rank = 16` describes the *combined* artifact; the older per-phase v1 manifest correctly records `lora_rank: 8`.
- The paper presents "rank 16, alpha 16" as the per-phase config — inconsistent with the shipped phase adapters.

### 2.3 Parameter budget (Table V) is wrong by construction
Measured directly from tensor shapes:

| Phase | Modules | Paper Table V | **Actual (measured)** |
|---|---|---|---|
| 1 | q,v | 3,670,016 | **1,843,200** |
| 2 | k,o | 3,670,016 | **1,843,200** |
| 3 | gate | 3,670,016 | **3,760,128** |
| 4 | up | 5,505,024 | **3,760,128** |
| 5 | down | 5,505,024 | **3,760,128** |
| 6 | all (rank 8) | 25,690,112 | **14,966,784** |
| combined | all (rank 16) | — | **29,933,568** |

The §V.C manifest-schema example also lists `trainable_overlay_parameters: 7340032` for phase 1; the real value is **1,843,200**. (Paper numbers ≈ rank16×28L; reality = rank8×36L for phases.) **Note:** artifact *sizes* (7/14/57 MB) are correct — only the parameter-count table is off.

### 2.4 Manifest fails its own JSON Schema
`smartweight.json` (schema_version `smartweights/v2`) is **missing the required `rft_space` property** that `smartweight.schema.json` mandates at top level. Per-phase v1 manifests include it; the compound v2 manifest dropped it. → schema validation raises `'rft_space' is a required property`.

### 2.5 Bundled CLI validator targets the wrong filename
`smartweights/cli.py validate` looks for `manifest.json` (`MANIFEST_FILENAME`), but the compound pack ships `smartweight.json`. Result: CLI reports `INVALID / manifest missing` and `bench valid_rate = 0.0`. Hash verification therefore had to be done out-of-band (done here; all pass). The CLI should accept `smartweight.json` or the pack should ship both.

### 2.6 distilled_training.jsonl line count
File has **29 non-blank lines**; paper/manifest/stats all say **25 entries**. Likely 4 trailing/duplicate records. Reconcile the count or the claim.

### 2.7 Empirical Tables VIII–X have **no reproducible harness in the repo**
This is the most important verification gap. The paper's headline empirical claims —
- per-capability gains **+7–16 pp** over monolithic LoRA (Table VIII),
- collateral drift **±0.18–0.23 → ±0.01–0.03**, ~12× (Table IX),
- injection resistance **0.38 → 0.84 avg** across 5 attack categories (Table X) —

have **no benchmark code, no result files, and no red-team suite** anywhere in `ELDRAE-` (only `scripts/eval/golden_prompts.json` exists; `knowledge_pack.json`'s `injection_summary` is just a Q&A text dump, not a 100-attempt-per-category resistance test). These numbers are currently **unreproducible from the published artifacts.**

The paper is partly self-aware here: Appendix B lists the per-capability and injection numbers under **"UNSUPPORTED CLAIMS,"** and §XIV flags the benchmark scope. But §XI/abstract/conclusion present them as demonstrated results. That tension should be resolved.

---

## 3. Verdict

**Structural / provenance claims: VALIDATED.** CMPT does exactly what it says at the artifact level — disjoint module-mapped phases, hash-bound SmartWeights registration, AACP trust-class partitioning at training-data admission, frozen base, independently swappable phase adapters. The protocol mechanics (Appendix A claims 1–8) all check out against the real pack.

**Empirical performance/security claims (Tables VIII–X): NOT VALIDATED — no harness or data.** Treat as design hypotheses until a benchmark suite is published. This is consistent with the paper's own Appendix B and Non-Goal §III.B ("does not aim to prove… improves task performance").

**Numeric tables (V, §V.C, layer/rank): NEEDS CORRECTION** to match the rank‑8 / 36‑layer reality of the shipped adapters.

---

## 4. Finalized protocol — required edits before publication

1. **Fix layer count** 28 → **36** everywhere (Table V, §VII.C).
2. **State rank honestly:** per-phase adapters = **rank 8**; combined = **rank 16, alpha 16**. Update abstract, §VII.A, Table II caption.
3. **Replace Table V** with measured parameter counts (§2.3 above).
4. **Correct §V.C example** `trainable_overlay_parameters` 7340032 → **1843200**.
5. **Add `rft_space` to `smartweight.json`** (or relax schema `required`) so the manifest validates against `smartweight.schema.json`.
6. **Fix the CLI validator** to recognize `smartweight.json`, or ship a `manifest.json` alias, so `smartweights validate/bench` works on the reference pack.
7. **Reconcile distilled entry count** (29 file lines vs 25 claimed).
8. **Either ship the benchmark harness** that produces Tables VIII–X (capability scorer + 100×5 injection red-team + single-phase-swap drift script) **or** demote those tables to "projected/illustrative" and lean on Appendix B. As the "final addition," shipping the harness is what turns CMPT from a structural protocol into an empirically validated one.

---

## 5. Reproduction commands used

```bash
# hashes (all 10 present artifacts matched manifest)
sha256sum smartweights/packs/eldrae-core/adapters/*/adapter_model.safetensors

# tensor shapes / rank / layers / params (safetensors header parse, no torch)
python3 parse_safetensors_headers.py   # -> 36 layers, phases rank 8, combined rank 16

# schema validation (-> missing rft_space)
jsonschema: smartweight.json vs schema/smartweight.schema.json

# counts
corpus domains = 21; knowledge_pack total_entries = 25, avg_quality = 0.644
distilled_training.jsonl non-blank lines = 29
```
