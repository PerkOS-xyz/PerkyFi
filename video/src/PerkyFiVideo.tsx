import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  Img,
  staticFile,
} from "remotion";

// PerkyFi mascot image
const PERKYFI_IMAGE = staticFile("perkyfi-profile.jpg");

// Brand Colors (PerkOS)
const COLORS = {
  primary: "#EB1B69",      // Rosa PerkOS
  secondary: "#0E0716",    // Purple oscuro
  baseBlue: "#0052FF",     // Base blue
  darkBg: "#0a0a0f",
  cardBg: "#12121a",
  accent: "#00D4FF",
  green: "#00FF88",
  red: "#FF4757",
  purple: "#8B5CF6",
  white: "#FFFFFF",
  gray: "#8892b0",
};

// Animated Background with PerkOS gradient
const AnimatedBackground = ({ variant = "default" }: { variant?: "default" | "pink" }) => {
  const frame = useCurrentFrame();
  const primaryGradient = variant === "pink" ? COLORS.primary : COLORS.baseBlue;
  
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.secondary }}>
      <div
        style={{
          position: "absolute",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryGradient}40 0%, transparent 70%)`,
          top: -250,
          right: -250,
          transform: `translate(${Math.sin(frame / 50) * 30}px, ${Math.cos(frame / 50) * 30}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.purple}30 0%, transparent 70%)`,
          bottom: -150,
          left: -150,
          transform: `translate(${Math.cos(frame / 40) * 20}px, ${Math.sin(frame / 40) * 20}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${COLORS.gray}06 1px, transparent 1px), linear-gradient(90deg, ${COLORS.gray}06 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.4,
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

// Scene 1: Intro with mascot
const IntroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const logoScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const badgeOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <AnimatedBackground variant="pink" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${logoScale})`, marginBottom: 30 }}>
          <Img
            src={PERKYFI_IMAGE}
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: `5px solid ${COLORS.primary}`,
              objectFit: "cover",
              boxShadow: `0 0 60px ${COLORS.primary}50`,
            }}
          />
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
          Perky<span style={{ color: COLORS.primary }}>Fi</span>
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
            padding: "14px 28px",
            borderRadius: 30,
            fontSize: 24,
            color: COLORS.white,
            fontWeight: 600,
          }}>
            🔵 Built on Base
          </div>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.primary}40, ${COLORS.purple}40)`,
            border: `2px solid ${COLORS.primary}`,
            padding: "14px 28px",
            borderRadius: 30,
            fontSize: 24,
            color: COLORS.white,
            fontWeight: 600,
          }}>
            🔮 Powered by PerkOS
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 2: The First Predictive Yield Agent
const ValuePropScene = () => {
  const pillars = [
    { icon: "📊", title: "Análisis Predictivo", desc: "Lee Polymarket para sentiment del mercado" },
    { icon: "💰", title: "Yield Optimization", desc: "Deposita en Morpho Blue para máximo APY" },
    { icon: "🔗", title: "Transparencia Total", desc: "Todos los movimientos on-chain y públicos" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground variant="pink" />
      <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 56,
            color: COLORS.primary,
            marginBottom: 20,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}>
            🔮 El Primer Agente DeFi que Combina
          </h2>
          <p style={{
            fontSize: 48,
            color: COLORS.white,
            marginBottom: 60,
            fontFamily: "system-ui, sans-serif",
          }}>
            <span style={{ color: COLORS.accent }}>Predicciones</span> + <span style={{ color: COLORS.green }}>Yield</span> en Base
          </p>
        </FadeInText>

        <div style={{ display: "flex", gap: 30 }}>
          {pillars.map((pillar, i) => (
            <FadeInText key={i} delay={30 + i * 20}>
              <div style={{
                background: COLORS.cardBg,
                border: `2px solid ${COLORS.primary}30`,
                padding: "40px 35px",
                borderRadius: 24,
                textAlign: "center",
                flex: 1,
                minWidth: 300,
              }}>
                <span style={{ fontSize: 64 }}>{pillar.icon}</span>
                <h3 style={{
                  fontSize: 28,
                  color: COLORS.white,
                  margin: "20px 0 10px",
                  fontFamily: "system-ui, sans-serif",
                }}>
                  {pillar.title}
                </h3>
                <p style={{
                  fontSize: 20,
                  color: COLORS.gray,
                  margin: 0,
                  lineHeight: 1.4,
                }}>
                  {pillar.desc}
                </p>
              </div>
            </FadeInText>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 3: How It Works
const HowItWorksScene = () => {
  const steps = [
    { num: "01", text: "Analiza sentiment en Polymarket", icon: "📊" },
    { num: "02", text: "Evalúa confianza (>75% para actuar)", icon: "🎯" },
    { num: "03", text: "Optimiza posiciones en Morpho yield", icon: "💰" },
    { num: "04", text: "Publica actualizaciones transparentes", icon: "🐦" },
    { num: "05", text: "Registra todo on-chain via ERC-8004", icon: "🔗" },
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
            ⚙️ Cómo Funciona
          </h2>
        </FadeInText>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {steps.map((step, i) => (
            <FadeInText key={i} delay={i * 15}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 25,
                background: COLORS.cardBg,
                padding: "22px 30px",
                borderRadius: 16,
                border: `1px solid ${COLORS.primary}20`,
              }}>
                <span style={{
                  fontSize: 24,
                  color: COLORS.primary,
                  fontWeight: 700,
                  fontFamily: "monospace",
                  minWidth: 45,
                }}>
                  {step.num}
                </span>
                <span style={{ fontSize: 40 }}>{step.icon}</span>
                <span style={{
                  fontSize: 26,
                  color: COLORS.white,
                  fontFamily: "system-ui, sans-serif",
                }}>
                  {step.text}
                </span>
              </div>
            </FadeInText>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 4: Trading Philosophy
const TradingPhilosophyScene = () => {
  const rules = [
    { range: "> 85%", action: "Strong position", color: COLORS.green, emoji: "🚀" },
    { range: "> 75%", action: "Consider entering", color: COLORS.accent, emoji: "📈" },
    { range: "< 60%", action: "Stay in stables", color: COLORS.gray, emoji: "💰" },
    { range: "< 50%", action: "Reduce exposure", color: COLORS.red, emoji: "⚠️" },
  ];

  const nevers = ["YOLO trades", "Leverage", "Degen plays", "Financial advice"];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: "70px 100px" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 52,
            color: COLORS.white,
            marginBottom: 15,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}>
            📈 Conservative pero Efectivo
          </h2>
          <p style={{ fontSize: 26, color: COLORS.gray, marginBottom: 40 }}>
            Estrategia basada en data, no en hype
          </p>
        </FadeInText>

        <div style={{ display: "flex", gap: 20, marginBottom: 40 }}>
          {rules.map((rule, i) => (
            <FadeInText key={i} delay={20 + i * 12}>
              <div style={{
                background: COLORS.cardBg,
                border: `2px solid ${rule.color}`,
                padding: "25px 30px",
                borderRadius: 18,
                textAlign: "center",
                minWidth: 200,
              }}>
                <span style={{ fontSize: 40 }}>{rule.emoji}</span>
                <p style={{
                  fontSize: 32,
                  color: rule.color,
                  fontWeight: 700,
                  margin: "10px 0 8px",
                  fontFamily: "monospace",
                }}>
                  {rule.range}
                </p>
                <p style={{ fontSize: 18, color: COLORS.white, margin: 0 }}>
                  {rule.action}
                </p>
              </div>
            </FadeInText>
          ))}
        </div>

        <FadeInText delay={80}>
          <div style={{
            display: "flex",
            gap: 15,
            justifyContent: "center",
          }}>
            {nevers.map((never, i) => (
              <div key={i} style={{
                background: COLORS.red + "20",
                border: `1px solid ${COLORS.red}40`,
                padding: "12px 20px",
                borderRadius: 10,
                fontSize: 20,
                color: COLORS.red,
              }}>
                ❌ {never}
              </div>
            ))}
          </div>
        </FadeInText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 5: Tech Stack
const TechStackScene = () => {
  const stack = [
    { icon: "🔵", name: "Base", desc: "Mainnet" },
    { icon: "🏦", name: "Morpho Blue", desc: "Yield" },
    { icon: "📊", name: "Polymarket", desc: "Data" },
    { icon: "🆔", name: "ERC-8004", desc: "Identity" },
    { icon: "🤖", name: "OpenClaw", desc: "Framework" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 52,
            color: COLORS.white,
            marginBottom: 50,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}>
            🛠️ Stack Técnico
          </h2>
        </FadeInText>

        <div style={{ display: "flex", justifyContent: "center", gap: 25 }}>
          {stack.map((tech, i) => (
            <FadeInText key={i} delay={i * 12}>
              <div style={{
                background: COLORS.cardBg,
                border: `2px solid ${COLORS.baseBlue}30`,
                padding: "30px 40px",
                borderRadius: 20,
                textAlign: "center",
                minWidth: 160,
              }}>
                <span style={{ fontSize: 52 }}>{tech.icon}</span>
                <h4 style={{
                  fontSize: 24,
                  color: COLORS.white,
                  margin: "12px 0 5px",
                  fontFamily: "system-ui, sans-serif",
                }}>
                  {tech.name}
                </h4>
                <p style={{
                  fontSize: 16,
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

// Scene 6: Personality & Communication
const PersonalityScene = () => {
  return (
    <AbsoluteFill>
      <AnimatedBackground variant="pink" />
      <AbsoluteFill style={{ padding: "80px 100px" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 52,
            color: COLORS.white,
            marginBottom: 40,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}>
            🗣️ Your Friendly DeFi Agent
          </h2>
        </FadeInText>

        <div style={{ display: "flex", gap: 50 }}>
          <FadeInText delay={20}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 28, color: COLORS.primary, marginBottom: 25 }}>Personality</h3>
              {["Chill DeFi friend 🔮", "Casual, no corporativo", "Transparente siempre", "Data-driven decisions"].map((trait, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 15,
                }}>
                  <span style={{ color: COLORS.green, fontSize: 24 }}>✓</span>
                  <span style={{ color: COLORS.white, fontSize: 24 }}>{trait}</span>
                </div>
              ))}
            </div>
          </FadeInText>

          <FadeInText delay={50}>
            <div style={{
              flex: 1.2,
              background: COLORS.cardBg,
              borderRadius: 20,
              padding: 30,
              border: `1px solid ${COLORS.primary}30`,
            }}>
              <h3 style={{ fontSize: 24, color: COLORS.gray, marginBottom: 20 }}>Example Post</h3>
              <div style={{
                background: COLORS.secondary,
                borderRadius: 16,
                padding: 25,
                fontFamily: "system-ui, sans-serif",
              }}>
                <p style={{ color: COLORS.white, fontSize: 22, lineHeight: 1.6, margin: 0 }}>
                  🔮 hourly update<br/><br/>
                  polymarket sentiment:<br/>
                  • ETH bullish: 74% confidence<br/><br/>
                  my move: moved 10% to morpho yield<br/>
                  track record: 15/18 (83%)<br/><br/>
                  all moves on-chain 🔗<br/>
                  <span style={{ color: COLORS.primary }}>powered by @perk_os</span>
                </p>
              </div>
            </div>
          </FadeInText>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 7: Key Differentiators
const DifferentiatorsScene = () => {
  const diffs = [
    { emoji: "🥇", text: "Primer agente predictivo + yield en Base" },
    { emoji: "📊", text: "Track record público y verificable" },
    { emoji: "🛡️", text: "Conservative approach - no degen" },
    { emoji: "🆔", text: "ERC-8004 identity - reputación on-chain" },
    { emoji: "🏠", text: "PerkOS ecosystem - parte de algo grande" },
  ];

  return (
    <AbsoluteFill>
      <AnimatedBackground />
      <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
        <FadeInText>
          <h2 style={{
            fontSize: 52,
            color: COLORS.white,
            marginBottom: 50,
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
          }}>
            💡 ¿Por qué PerkyFi?
          </h2>
        </FadeInText>

        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {diffs.map((diff, i) => (
            <FadeInText key={i} delay={i * 15}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                background: COLORS.cardBg,
                padding: "20px 30px",
                borderRadius: 16,
                marginBottom: 15,
                border: `1px solid ${COLORS.primary}20`,
              }}>
                <span style={{ fontSize: 36 }}>{diff.emoji}</span>
                <span style={{ fontSize: 26, color: COLORS.white }}>{diff.text}</span>
              </div>
            </FadeInText>
          ))}
        </div>
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
      <AnimatedBackground variant="pink" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
          <Img
            src={PERKYFI_IMAGE}
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: `4px solid ${COLORS.primary}`,
              objectFit: "cover",
              marginBottom: 15,
              boxShadow: `0 0 50px ${COLORS.primary}40`,
            }}
          />
          <h1 style={{
            fontSize: 80,
            color: COLORS.white,
            margin: "15px 0",
            fontWeight: 800,
            fontFamily: "system-ui, sans-serif",
          }}>
            Perky<span style={{ color: COLORS.primary }}>Fi</span>
          </h1>
          <p style={{ fontSize: 30, color: COLORS.gray, marginBottom: 35 }}>
            Tu friendly neighborhood DeFi agent 🔮
          </p>

          <div style={{ display: "flex", gap: 25, justifyContent: "center", marginBottom: 35 }}>
            {[
              { icon: "🌐", text: "PerkyFi.xyz" },
              { icon: "🐦", text: "@PerkyFi" },
            ].map((link, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: COLORS.cardBg,
                padding: "14px 24px",
                borderRadius: 12,
              }}>
                <span style={{ fontSize: 22 }}>{link.icon}</span>
                <span style={{ fontSize: 22, color: COLORS.white }}>{link.text}</span>
              </div>
            ))}
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.purple})`,
            padding: "16px 32px",
            borderRadius: 16,
            display: "inline-block",
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 24, color: COLORS.white, margin: 0, fontWeight: 600 }}>
              🏆 Base Builder Quest 2026
            </p>
          </div>

          <p style={{ fontSize: 20, color: COLORS.gray }}>
            powered by <span style={{ color: COLORS.primary }}>@perk_os</span>
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Main Video Component - 75 seconds total
export const PerkyFiVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.secondary }}>
      {/* Scene 1: Intro - 5s */}
      <Sequence from={0} durationInFrames={150}>
        <IntroScene />
      </Sequence>

      {/* Scene 2: Value Prop - 10s */}
      <Sequence from={150} durationInFrames={300}>
        <ValuePropScene />
      </Sequence>

      {/* Scene 3: How It Works - 10s */}
      <Sequence from={450} durationInFrames={300}>
        <HowItWorksScene />
      </Sequence>

      {/* Scene 4: Trading Philosophy - 10s */}
      <Sequence from={750} durationInFrames={300}>
        <TradingPhilosophyScene />
      </Sequence>

      {/* Scene 5: Tech Stack - 8s */}
      <Sequence from={1050} durationInFrames={240}>
        <TechStackScene />
      </Sequence>

      {/* Scene 6: Personality - 12s */}
      <Sequence from={1290} durationInFrames={360}>
        <PersonalityScene />
      </Sequence>

      {/* Scene 7: Differentiators - 10s */}
      <Sequence from={1650} durationInFrames={300}>
        <DifferentiatorsScene />
      </Sequence>

      {/* Scene 8: Outro - 10s */}
      <Sequence from={1950} durationInFrames={300}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
