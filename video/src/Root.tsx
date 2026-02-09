import { Composition } from "remotion";
import { PerkyFiVideo } from "./PerkyFiVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PerkyFiDemo"
        component={PerkyFiVideo}
        durationInFrames={2250} // 75 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
