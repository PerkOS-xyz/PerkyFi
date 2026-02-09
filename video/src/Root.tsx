import { Composition } from "remotion";
import { PerkyFiVideo } from "./PerkyFiVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PerkyFiDemo"
        component={PerkyFiVideo}
        durationInFrames={30 * 120} // 2 minutes at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
