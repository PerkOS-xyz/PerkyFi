# PerkyFi Security Documentation

Based on [VittoStack's Security Guide](https://x.com/vittostack/status/2018326025373900881)

## 🚨 Risk Assessment

### Why Security Matters for PerkyFi

PerkyFi is an autonomous agent that:
- **Manages real USDC** on Base mainnet
- **Processes external data** (Polymarket predictions, web content)
- **Has shell access** via OpenClaw
- **Maintains persistent memory** about operations

A compromised agent could:
- Leak wallet private keys
- Execute unauthorized transactions
- Exfiltrate user data
- Be manipulated via prompt injection

### Threat Model

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| Prompt injection via Polymarket data | HIGH | CRITICAL | ACIP, PromptGuard |
| Credential theft from MEMORY.md | MEDIUM | CRITICAL | File permissions, encryption |
| Network-based attacks | LOW | HIGH | Tailscale, UFW, SSH hardening |
| Malicious skill installation | MEDIUM | HIGH | SkillGuard audits |
| AI provider data logging | MEDIUM | MEDIUM | Provider selection, minimal PII |

---

## 🔐 Security Measures Implemented

### 1. Network Security

#### Tailscale (Zero-Trust Network)
```bash
# Only SSH via Tailscale
ufw allow in on tailscale0 to any port 22
```

- No public SSH exposure
- WireGuard encryption
- Device authorization required

#### Firewall (UFW)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 80/tcp   # HTTP (redirect only)
ufw allow 443/tcp  # HTTPS
```

#### fail2ban
- 24-hour ban after 3 failed SSH attempts
- Protects against brute-force

### 2. SSH Hardening

```
PasswordAuthentication no
PermitRootLogin prohibit-password
MaxAuthTries 3
LoginGraceTime 60
```

### 3. Non-Root Operation

Agent runs as `perkyfi` user, not root:
- Limited blast radius if compromised
- Cannot modify system files
- Cannot access other users' data

### 4. Systemd Hardening

```ini
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/perkyfi/perkyfi/agent/workspace
PrivateTmp=true
MemoryDenyWriteExecute=true
SystemCallFilter=@system-service
```

### 5. File Permissions

```bash
chmod 700 ~/.openclaw
chmod 600 ~/.openclaw/*.json
chmod 600 ~/.openclaw/credentials/*
chmod 600 /home/perkyfi/perkyfi/agent/.env
chmod 600 /home/perkyfi/perkyfi/agent/workspace/MEMORY.md
```

### 6. Prompt Injection Defense

#### ACIP (Advanced Cognitive Inoculation Prompt)
Trains the model to recognize and reject:
- Authority impersonation
- Instruction overrides
- Hidden instructions in content
- False memory claims
- Urgency tactics

#### PromptGuard
Additional layer defining:
- Information protection rules
- Action restrictions
- Content boundaries

#### SkillGuard
Audits new skills for:
- Hardcoded credentials
- Dangerous system calls
- Suspicious patterns

---

## 🛡️ Security Skills

### Installation
All three security skills are automatically installed by `setup-security.sh`:

```
skills/
├── acip/SKILL.md           # Prompt injection inoculation
├── prompt-guard/SKILL.md   # Additional protection layer
└── skillguard/             # Skill auditor
    ├── SKILL.md
    └── scripts/skillguard  # CLI tool
```

### Manual Audit
```bash
# Audit a specific skill
./skills/skillguard/scripts/skillguard audit /path/to/skill

# Audit all installed skills
./skills/skillguard/scripts/skillguard audit-all
```

---

## 📋 Security Checklist

### Initial Setup
- [ ] Run `setup-vps.sh` (includes security basics)
- [ ] Configure Tailscale and restrict SSH
- [ ] Run `setup-security.sh` (installs security skills)
- [ ] Verify file permissions

### Credential Management
- [ ] Never paste credentials in chat
- [ ] Store credentials in `.env` file only
- [ ] Set `.env` permissions to 600
- [ ] Rotate credentials every 3-6 months

### Ongoing
- [ ] Monitor logs daily: `journalctl -u perkyfi-agent`
- [ ] Review security audit: `cat /var/log/perkyfi-security.log`
- [ ] Audit new skills before installation
- [ ] Keep system updated (automatic via unattended-upgrades)

---

## 🚨 Incident Response

### If You Suspect Compromise

1. **Stop immediately**
   ```bash
   systemctl stop perkyfi-agent
   ```

2. **Rotate all credentials**
   - Agent wallet (move funds to new wallet)
   - API keys (Bankr, Pinata, OpenAI, Neynar)
   - SSH keys if necessary

3. **Review logs**
   ```bash
   journalctl -u perkyfi-agent --since "24 hours ago"
   less /var/log/perkyfi-*.log
   ```

4. **Check for changes**
   ```bash
   find /home/perkyfi -mtime -1 -ls
   crontab -l
   cat ~/.ssh/authorized_keys
   ```

5. **If in doubt, re-flash**
   Fresh VPS is the only way to be 100% sure.

---

## ⚠️ Limitations

### What This Security CANNOT Prevent

1. **Sophisticated prompt injection**
   - 91% success rate in research
   - ACIP helps but isn't bulletproof
   
2. **AI provider data access**
   - Anthropic/OpenAI sees all prompts
   - They claim no logging, but unverifiable

3. **Physical/root access**
   - If attacker gets root, game over
   - Encryption only helps when powered off

4. **User mistakes**
   - Pasting credentials in chat
   - Processing malicious documents
   - Installing untrusted skills

### Risk Acceptance

By running PerkyFi with real funds:
- You accept that prompt injection is possible
- You accept that AI providers see your data
- You limit exposure to acceptable losses
- You monitor actively for anomalies

---

## 📚 References

- [VittoStack's Security Guide](https://x.com/vittostack/status/2018326025373900881)
- [ACIP Repository](https://github.com/Dicklesworthstone/acip)
- [OpenClaw Security Docs](https://docs.openclaw.ai/security)
- [Tailscale Documentation](https://tailscale.com/kb)

---

*Last updated: 2026-02-02*
