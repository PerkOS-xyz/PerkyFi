import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";

// Colors
const COLORS = {
  baseBlue: "#0052FF",
  darkBg: "#0a0a0f",
  cardBg: "#12121a",
  accent: "#00D4FF",
  green: "#00FF88",
  red: "#FF4757",
  purple: "#8B5CF6",
  white: "#FFFFFF",
  gray: "#8892b0",
};

// Animated Background
const AnimatedBackground = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.darkBg }}>
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.baseBlue}40 0%, transparent 70%)`,
          top: -200,
          right: -200,
          transform: `translate(${Math.sin(frame / 50) * 30}px, ${Math.cos(frame / 50) * 30}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.purple}30 0%, transparent 70%)`,
          bottom: -100,
          left: -100,
          transform: `translate(${Math.cos(frame / 40) * 20}px, ${Math.sin(frame / 40) * 20}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.gray}08 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gray}08 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};

// Fade In Text Component
const FadeInText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame - delay, [0, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  return (
    <div style={{ ...style, opacity, transform: `translateY(${y}px)` }}>
      {children}
    </div>
  );
};

// Scene 1: Intro
const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const badgeOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${logoScale})`, marginBottom: 30 }}>
          <span style={{ fontSize: 150 }}>🔮</span>
        </div>
        
        <h1 style={{
          fontSize: 120,
          fontWeight: 800,
          color: COLORS.white,
          margin: 0,
          opacity: titleOpacity,
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: -3,
        }}>
          Perky<span style={{ color: COLORS.baseBlue }}>Fi</span>
        </h1>
        
        <p style={{
          fontSize: 42,
          color: COLORS.gray,
          margin: "20px 0 40px",
          opacity: subtitleOpacity,
          fontFamily: "system-ui, sans-serif",
        }}>
          Predictive Yield Agent on Base
        </p>
        
        <div style={{ display: "flex", gap: 20, opacity: badgeOpacity }}>
          <div style={{
            background: COLORS.baseBlue,
            padding: "12px 24px",
            borderRadius: 30,
            fontSize: 24,
            color: COLORS.white,
            fontWeight: 600,
          }}>
            🔵 Built on Base
          </div>
          <div style={{
            background: COLORS.cardBg,
            border: `2px solid ${COLORS.purple}`,
            padding: "12px 24px",
            borderRadius: 30,
            fontSize: 24,
            color: COLORS.purple,
            fontWeight: 600,
          }}>
            🤖 Autonomous AI Agent
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 2: What is PerkyFi
const WhatIsPerkyFiScene = () => {
  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 64,
            color: COLORS.accent,
            marginBottom: 50,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}>
            🔮 What is PerkyFi?
          </h2>
        </FadeInText>

        <FadeInText delay={20}>
          <p style={{
            fontSize: 42,
            color: COLORS.white,
            lineHeight: 1.6,
            marginBottom: 50,
            fontFamily: "system-ui, sans-serif",
          }}>
            An <span style={{ color: COLORS.green }}>autonomous AI agent</span> that analyzes{" "}
            <span style={{ color: COLORS.purple }}>Polymarket predictions</span> to optimize{" "}
            <span style={{ color: COLORS.baseBlue }}>yield allocation on Morpho</span>
          </p>
        </FadeInText>

        <div style={{ display: "flex", gap: 30 }}>
          {[
            { emoji: "🧠", text: "AI-Powered Analysis" },
            { emoji: "⚡", text: "Autonomous Execution" },
            { emoji: "📊", text: "Real-time Decisions" },
          ].map((item, i) => (
            <FadeInText key={i} delay={40 + i * 15}>
              <div style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.baseBlue}40`,
                padding: "25px 35px",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                gap: 15,
              }}>
                <span style={{ fontSize: 40 }}>{item.emoji}</span>
                <span style={{ fontSize: 24, color: COLORS.white }}>{item.text}</span>
              </div>
            </FadeInText>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 3: Core Features
const CoreFeaturesScene = () => {
  const features = [
    { icon: "📊", title: "Polymarket Integration", desc: "Analyzes crypto prediction markets for sentiment signals" },
    { icon: "🏦", title: "Morpho Yield Vaults", desc: "Deposits and withdraws from Steakhouse USDC vault on Base" },
    { icon: "🐦", title: "Social Sharing", desc: "Automatically posts trade signals on X/Twitter" },
    { icon: "💳", title: "x402 Monetization", desc: "Users pay $0.10 USDC to access full trade details" },
    { icon: "🔗", title: "On-chain Identity", desc: "ERC-8004 reputation tracking on Ethereum" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: "70px 100px" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 56,
            color: COLORS.white,
            marginBottom: 40,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}>
            ✨ Core Features
          </h2>
        </FadeInText>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {features.map((feature, i) => (
            <FadeInText key={i} delay={i * 15}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 25,
                background: COLORS.cardBg,
                padding: "22px 30px",
                borderRadius: 16,
                border: `1px solid ${COLORS.baseBlue}30`,
              }}>
                <span style={{ fontSize: 40 }}>{feature.icon}</span>
                <div>
                  <h4 style={{
                    fontSize: 26,
                    color: COLORS.white,
                    margin: 0,
                    fontFamily: "system-ui, sans-serif",
                  }}>
                    {feature.title}
                  </h4>
                  <p style={{
                    fontSize: 20,
                    color: COLORS.gray,
                    margin: "5px 0 0",
                    fontFamily: "system-ui, sans-serif",
                  }}>
                    {feature.desc}
                  </p>
                </div>
              </div>
            </FadeInText>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 4: Trading Strategy
const TradingStrategyScene = () => {
  const thresholds = [
    { range: "> 85%", action: "Strong position", color: COLORS.green, emoji: "🚀" },
    { range: "> 75%", action: "Consider entering", color: COLORS.accent, emoji: "📈" },
    { range: "< 60%", action: "Stay in stables", color: COLORS.gray, emoji: "💰" },
    { range: "< 50%", action: "Reduce exposure", color: COLORS.red, emoji: "⚠️" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: 100 }}>
        <FadeInText>
          <h2 style={{
            fontSize: 56,
            color: COLORS.white,
            marginBottom: 20,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}>
            📊 Conservative Trading Strategy
          </h2>
          <p style={{ fontSize: 28, color: COLORS.gray, marginBottom: 50 }}>
            Risk-managed decisions based on Polymarket confidence scores
          </p>
        </FadeInText>

        <div style={{ display: "flex", gap: 25 }}>
          {thresholds.map((t, i) => (
            <FadeInText key={i} delay={20 + i * 15}>
              <div style={{
                background: COLORS.cardBg,
                border: `2px solid ${t.color}`,
                padding: "30px 35px",
                borderRadius: 20,
                textAlign: "center",
                minWidth: 220,
              }}>
                <span style={{ fontSize: 48 }}>{t.emoji}</span>
                <p style={{
                  fontSize: 36,
                  color: t.color,
                  fontWeight: 700,
                  margin: "15px 0 10px",
                  fontFamily: "monospace",
                }}>
                  {t.range}
                </p>
                <p style={{
                  fontSize: 22,
                  color: COLORS.white,
                  margin: 0,
                }}>
                  {t.action}
                </p>
              </div>
            </FadeInText>
          ))}
        </div>

        <FadeInText delay={100}>
          <div style={{
            marginTop: 50,
            padding: "20px 30px",
            background: COLORS.baseBlue + "20",
            borderRadius: 12,
            borderLeft: `4px solid ${COLORS.baseBlue}`,
          }}>
            <p style={{ fontSize: 24, color: COLORS.white, margin: 0 }}>
              💡 PerkyFi never YOLOs, never uses leverage, and always explains its reasoning
            </p>
          </div>
        </FadeInText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 5: Tech Stack
const TechStackScene = () => {
  const stack = [
    { icon: "🔵", name: "Base", desc: "L2 Network", color: COLORS.baseBlue },
    { icon: "🏦", name: "Morpho", desc: "Yield Protocol", color: COLORS.green },
    { icon: "💳", name: "x402", desc: "Payments", color: COLORS.accent },
    { icon: "🤖", name: "OpenClaw", desc: "Agent Framework", color: COLORS.purple },
    { icon: "📊", name: "Polymarket", desc: "Predictions", color: COLORS.red },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 56,
            color: COLORS.white,
            marginBottom: 20,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}>
            🛠️ Powered by Coinbase Developer Platform
          </h2>
          <p style={{ fontSize: 28, color: COLORS.gray, marginBottom: 50, textAlign: "center" }}>
            Built entirely on Base using cutting-edge Web3 infrastructure
          </p>
        </FadeInText>

        <div style={{ display: "flex", justifyContent: "center", gap: 25 }}>
          {stack.map((tech, i) => (
            <FadeInText key={i} delay={i * 12}>
              <div style={{
                background: COLORS.cardBg,
                border: `2px solid ${tech.color}40`,
                padding: "30px 40px",
                borderRadius: 20,
                textAlign: "center",
                minWidth: 170,
              }}>
                <span style={{ fontSize: 52 }}>{tech.icon}</span>
                <h4 style={{
                  fontSize: 26,
                  color: COLORS.white,
                  margin: "12px 0 5px",
                  fontFamily: "system-ui, sans-serif",
                }}>
                  {tech.name}
                </h4>
                <p style={{
                  fontSize: 18,
                  color: COLORS.gray,
                  margin: 0,
                }}>
                  {tech.desc}
                </p>
              </div>
            </FadeInText>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 6: How Copy-Trade Works
const CopyTradeScene = () => {
  const steps = [
    { num: "1", text: "PerkyFi analyzes Polymarket & executes trade on Morpho" },
    { num: "2", text: "Posts trade signal on X with app.perkyfi.xyz link" },
    { num: "3", text: "User clicks link → sees x402 payment gate ($0.10)" },
    { num: "4", text: "After payment, user gets full trade details" },
    { num: "5", text: "User can copy the exact trade with one click" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: "80px 100px" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 56,
            color: COLORS.white,
            marginBottom: 50,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}>
            🔄 Copy-Trade Flow
          </h2>
        </FadeInText>

        <div style={{ display: "flex", gap: 50 }}>
          <div style={{ flex: 1 }}>
            {steps.map((step, i) => (
              <FadeInText key={i} delay={i * 20}>
                <div style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 20,
                  marginBottom: 25,
                }}>
                  <div style={{
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                    background: COLORS.baseBlue,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: COLORS.white,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {step.num}
                  </div>
                  <p style={{
                    fontSize: 26,
                    color: COLORS.white,
                    margin: 0,
                    lineHeight: 1.4,
                  }}>
                    {step.text}
                  </p>
                </div>
              </FadeInText>
            ))}
          </div>

          <FadeInText delay={60}>
            <div style={{
              background: COLORS.cardBg,
              borderRadius: 24,
              padding: 35,
              border: `2px solid ${COLORS.accent}`,
              width: 400,
            }}>
              <div style={{ textAlign: "center", marginBottom: 25 }}>
                <p style={{ fontSize: 20, color: COLORS.gray, margin: 0 }}>Signal Access Price</p>
                <p style={{ fontSize: 64, color: COLORS.accent, margin: "10px 0", fontWeight: 700 }}>$0.10</p>
                <p style={{ fontSize: 18, color: COLORS.gray, margin: 0 }}>USDC on Base</p>
              </div>
              <div style={{
                background: COLORS.baseBlue + "20",
                padding: 15,
                borderRadius: 12,
                textAlign: "center",
              }}>
                <p style={{ fontSize: 18, color: COLORS.white, margin: 0 }}>
                  Revenue reinvested in yield strategies
                </p>
              </div>
            </div>
          </FadeInText>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 7: Transparency & Trust
const TransparencyScene = () => {
  const points = [
    { emoji: "📜", text: "Every trade logged on-chain" },
    { emoji: "🎯", text: "Win/loss ratio published publicly" },
    { emoji: "🤝", text: "Mistakes acknowledged openly" },
    { emoji: "🔍", text: "Full transaction history on BaseScan" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: 100, justifyContent: "center", alignItems: "center" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 56,
            color: COLORS.green,
            marginBottom: 50,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}>
            🛡️ Transparency {">"} Perfection
          </h2>
        </FadeInText>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 25, justifyContent: "center", maxWidth: 1000 }}>
          {points.map((point, i) => (
            <FadeInText key={i} delay={i * 15}>
              <div style={{
                background: COLORS.cardBg,
                border: `1px solid ${COLORS.green}40`,
                padding: "25px 35px",
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                gap: 15,
                minWidth: 400,
              }}>
                <span style={{ fontSize: 36 }}>{point.emoji}</span>
                <span style={{ fontSize: 26, color: COLORS.white }}>{point.text}</span>
              </div>
            </FadeInText>
          ))}
        </div>

        <FadeInText delay={80}>
          <p style={{
            fontSize: 32,
            color: COLORS.gray,
            marginTop: 50,
            textAlign: "center",
            fontStyle: "italic",
          }}>
            "confident but humble — here's my analysis, but i could be wrong"
          </p>
        </FadeInText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 8: Outro
const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
          <span style={{ fontSize: 120 }}>🔮</span>
          <h1 style={{
            fontSize: 90,
            color: COLORS.white,
            margin: "20px 0",
            fontWeight: 800,
            fontFamily: "system-ui, sans-serif",
          }}>
            Perky<span style={{ color: COLORS.baseBlue }}>Fi</span>
          </h1>
          <p style={{ fontSize: 32, color: COLORS.gray, marginBottom: 40 }}>
            Autonomous Yield Optimization on Base
          </p>

          <div style={{ display: "flex", gap: 30, justifyContent: "center", marginBottom: 40 }}>
            {[
              { icon: "🌐", text: "perkyfi.xyz" },
              { icon: "🐦", text: "@PerkyFi" },
              { icon: "📦", text: "Open Source" },
            ].map((link, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: COLORS.cardBg,
                padding: "15px 25px",
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 22 }}>{link.icon}</span>
                <span style={{ fontSize: 22, color: COLORS.white }}>{link.text}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: COLORS.baseBlue,
            padding: "18px 35px",
            borderRadius: 16,
            display: "inline-block",
          }}>
            <p style={{ fontSize: 26, color: COLORS.white, margin: 0, fontWeight: 600 }}>
              🏆 Built for Base Builder Quest 2026
            </p>
          </div>

          <p style={{
            fontSize: 22,
            color: COLORS.gray,
            marginTop: 30,
          }}>
            Part of the PerkOS ecosystem
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Main Video Component - 70 seconds total
export const PerkyFiVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.darkBg }}>
      {/* Scene 1: Intro - 5s */}
      <Sequence from={0} durationInFrames={150}>
        <IntroScene />
      </Sequence>

      {/* Scene 2: What is PerkyFi - 8s */}
      <Sequence from={150} durationInFrames={240}>
        <WhatIsPerkyFiScene />
      </Sequence>

      {/* Scene 3: Core Features - 12s */}
      <Sequence from={390} durationInFrames={360}>
        <CoreFeaturesScene />
      </Sequence>

      {/* Scene 4: Trading Strategy - 10s */}
      <Sequence from={750} durationInFrames={300}>
        <TradingStrategyScene />
      </Sequence>

      {/* Scene 5: Tech Stack - 10s */}
      <Sequence from={1050} durationInFrames={300}>
        <TechStackScene />
      </Sequence>

      {/* Scene 6: Copy-Trade Flow - 12s */}
      <Sequence from={1350} durationInFrames={360}>
        <CopyTradeScene />
      </Sequence>

      {/* Scene 7: Transparency - 8s */}
      <Sequence from={1710} durationInFrames={240}>
        <TransparencyScene />
      </Sequence>

      {/* Scene 8: Outro - 5s */}
      <Sequence from={1950} durationInFrames={150}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
