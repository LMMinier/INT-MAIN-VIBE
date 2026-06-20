import React from "react";
import { Composition } from "remotion";
import { Slideshow } from "./Slideshow";
import manifest from "./manifest.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Hispaniola"
      component={Slideshow}
      durationInFrames={manifest.totalFrames}
      fps={manifest.fps}
      width={manifest.width}
      height={manifest.height}
    />
  );
};
