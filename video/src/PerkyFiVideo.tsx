import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

// Scene components
const IntroScene = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  
  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#0052FF", 
      justifyContent: "center", 
      alignItems: "center",
      opacity 
    }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: 120, margin: 0 }}>🔮 PerkyFi</h1>
        <p style={{ fontSize: 48 }}>Predictive Yield Agent on Base</p>
      </div>
    </AbsoluteFill>
  );
};

const ProblemScene = () => {
  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#1a1a2e", 
      justifyContent: "center", 
      alignItems: "center",
      padding: 100
    }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: 72, color: "#ff6b6b" }}>The Problem</h2>
        <p style={{ fontSize: 42, lineHeight: 1.6 }}>
          DeFi yield optimization requires constant monitoring<br/>
          and manual rebalancing based on market conditions
        </p>
      </div>
    </AbsoluteFill>
  );
};

const SolutionScene = () => {
  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#1a1a2e", 
      justifyContent: "center", 
      alignItems: "center",
      padding: 100
    }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <h2 style={{ fontSize: 72, color: "#4ade80" }}>The Solution</h2>
        <p style={{ fontSize: 42, lineHeight: 1.6 }}>
          PerkyFi: An autonomous AI agent that<br/>
          analyzes Polymarket predictions to<br/>
          optimize yield on Morpho (Base)
        </p>
      </div>
    </AbsoluteFill>
  );
};

const HowItWorksScene = () => {
  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#1a1a2e", 
      justifyContent: "center", 
      alignItems: "center",
      padding: 100
    }}>
      <div style={{ color: "white" }}>
        <h2 style={{ fontSize: 72, textAlign: "center", marginBottom: 60 }}>How It Works</h2>
        <div style={{ fontSize: 36, lineHeight: 2 }}>
          <p>1️⃣ Fetches Polymarket crypto predictions</p>
          <p>2️⃣ Analyzes market sentiment & confidence</p>
          <p>3️⃣ Executes trades on Morpho (Base)</p>
          <p>4️⃣ Shares signals on X with copy-trade links</p>
          <p>5️⃣ Monetizes via x402 micropayments</p>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TechStackScene = () => {
  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#1a1a2e", 
      justifyContent: "center", 
      alignItems: "center",
      padding: 100
    }}>
      <div style={{ color: "white" }}>
        <h2 style={{ fontSize: 72, textAlign: "center", marginBottom: 60 }}>Built on Base</h2>
        <div style={{ fontSize: 36, display: "flex", gap: 60, justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 48 }}>🔵</p>
            <p>Base Network</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 48 }}>💰</p>
            <p>Morpho Vaults</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 48 }}>💳</p>
            <p>x402 Payments</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 48 }}>🤖</p>
            <p>OpenClaw Agent</p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const DemoScene = () => {
  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#1a1a2e", 
      justifyContent: "center", 
      alignItems: "center",
      padding: 100
    }}>
      <div style={{ color: "white", textAlign: "center" }}>
        <h2 style={{ fontSize: 72 }}>Live Demo</h2>
        <p style={{ fontSize: 42, color: "#888" }}>
          [Insert screen recording here]
        </p>
      </div>
    </AbsoluteFill>
  );
};

const OutroScene = () => {
  return (
    <AbsoluteFill style={{ 
      backgroundColor: "#0052FF", 
      justifyContent: "center", 
      alignItems: "center"
    }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <h1 style={{ fontSize: 100 }}>🔮 PerkyFi</h1>
        <p style={{ fontSize: 42, marginTop: 20 }}>Autonomous Yield Optimization</p>
        <div style={{ marginTop: 60, fontSize: 32 }}>
          <p>🌐 perkyfi.xyz</p>
          <p>🐦 @PerkyFi</p>
          <p>📦 github.com/PerkOS-xyz/PerkyFi</p>
        </div>
        <p style={{ marginTop: 60, fontSize: 28, opacity: 0.8 }}>
          Built for Base Builder Quest 2026
        </p>
      </div>
    </AbsoluteFill>
  );
};

export const PerkyFiVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Intro - 5 seconds */}
      <Sequence from={0} durationInFrames={150}>
        <IntroScene />
      </Sequence>

      {/* Problem - 10 seconds */}
      <Sequence from={150} durationInFrames={300}>
        <ProblemScene />
      </Sequence>

      {/* Solution - 10 seconds */}
      <Sequence from={450} durationInFrames={300}>
        <SolutionScene />
      </Sequence>

      {/* How It Works - 15 seconds */}
      <Sequence from={750} durationInFrames={450}>
        <HowItWorksScene />
      </Sequence>

      {/* Tech Stack - 10 seconds */}
      <Sequence from={1200} durationInFrames={300}>
        <TechStackScene />
      </Sequence>

      {/* Demo placeholder - 60 seconds */}
      <Sequence from={1500} durationInFrames={1800}>
        <DemoScene />
      </Sequence>

      {/* Outro - 10 seconds */}
      <Sequence from={3300} durationInFrames={300}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
