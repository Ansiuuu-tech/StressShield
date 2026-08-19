import { motion } from 'framer-motion';
import { Shield, Heart, Brain, Sparkles, Linkedin, Twitter, Mail, GraduationCap, Stethoscope, Palette } from 'lucide-react';
import Portal from '../components/Portal';
import AshishPhoto from "../../Team_Img/Ashish_Project.jpeg";
import AnshuPhoto from "../../Team_Img/Anshu_Project.jpeg";
import AyanshPhoto from "../../Team_Img/Ayansh_Project.jpeg";
import BibhashPhoto from "../../Team_Img/Bibhash.png";




const TEAM_MEMBERS = [
  {
    name: 'Anshu Gaur',
    role: 'Founder & CEO',
    bio: 'Btech Cse student with passion in Web-dev, Ai and other technologies.',
    icon: GraduationCap,
    color: '#f472b6',
    initials: 'AG',
    photo: AnshuPhoto,
    socials: [
      { icon: Linkedin, href: 'https://www.linkedin.com/in/anshu-gaur-302774332/' },
      { icon: Twitter, href: '#' },
      { icon: Mail, href: '#' },
    ],
  },
  {
    name: 'Ayansh Dubey',
    role: 'Co-founder & ML Engineer',
    bio: 'Machine learning engineer with experience in developing AI-powered solutions.',
    icon: GraduationCap,
    color: '#60a5fa',
    initials: 'AD',
    // TODO: replace with real photo
    photo: AyanshPhoto,
    socials: [
      { icon: Linkedin, href: 'https://www.linkedin.com/in/ayansh-dubey-815788324/' },
      { icon: Mail, href: '#' },
    ],
  },
  {
    name: 'Bibhash',
    role: 'Co-Founder & Frontend Engineer',
    bio: 'Frontend engineer with experience in building responsive and accessible web applications.',
    icon: Palette,
    color: '#a78bfa',
    initials: 'BK',
    // TODO: replace with real photo
    photo: BibhashPhoto,
    socials: [
      { icon: Linkedin, href: 'https://www.linkedin.com/in/bibhash-02a846329/' },
      { icon: Twitter, href: '#' },
    ],
  },
  {
    name: 'Ashish Tiwari',
    role: 'Co-founder & Backend Engineer',
    bio: 'Backend engineer with experience in developing backend systems.',
    icon: GraduationCap,
    color: '#4ade80',
    initials: 'AT',
    // TODO: replace with real photo
    photo: AshishPhoto,
    socials: [
      { icon: Linkedin, href: 'https://www.linkedin.com/in/ashish-tiwari-48845932a/' },
      { icon: Twitter, href: '#' },
      { icon: Mail, href: '#' },
    ],
  },
];



function TeamCard({ member, index }) {
  const Icon = member.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      whileHover={{ y: -4 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        aspectRatio: '1/1',
        background: `linear-gradient(135deg, ${member.color}22 0%, ${member.color}11 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* for photo */}
        
        {/* Placeholder avatar with initials */}
                {member.photo ? (
          <img
            src={member.photo}
            alt={member.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ) : (
          <div style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: member.color,
            color: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Fraunces, serif',
            fontWeight: 700,
            fontSize: '2.5rem',
            letterSpacing: '-0.02em',
            boxShadow: '0 8px 32px ' + member.color + '44',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
          }}>
            {member.initials}
          </div>
        )}
        {/* Subtle duotone overlay effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at center, transparent 40%, ${member.color}22 100%)`,
          opacity: hovered ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }} />
      </div>

      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: member.color + '22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <Icon size={20} style={{ color: member.color }} />
        </div>

        <h3 style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: 4,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          {member.name}
        </h3>
        <p style={{
          fontSize: '0.9rem',
          color: member.color,
          fontWeight: 500,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {member.role}
        </p>
        <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 20, flex: 1 }}>
          {member.bio}
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          {member.socials.map((social, i) => {
            const SocialIcon = social.icon;
            return (
              <a
                key={i}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'var(--surface-muted)',
                  color: 'var(--ink-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = member.color;
                  e.currentTarget.style.color = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--surface-muted)';
                  e.currentTarget.style.color = 'var(--ink-soft)';
                }}
              >
                <SocialIcon size={16} />
              </a>
            );
          })}
        </div>
      </div>
    </motion.article>
  );
}

import { useState } from 'react';

export default function Team() {
  return (
    <Portal title="Our Team" subtitle="The people behind StressShield — educators, clinicians, and builders who care deeply about teacher wellbeing.">
      <section style={{ padding: '80px 0 100px' }}>
        {/* Hero Section - Dark, moody editorial style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #121212 100%)',
            borderRadius: 'var(--r-lg)',
            padding: 'clamp(60px, 10vw, 100px) clamp(24px, 6vw, 60px)',
            marginBottom: 60,
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          {/* Subtle ambient glow */}
          <div style={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #c98a2b33 0%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #4ade8022 0%, transparent 70%)',
            filter: 'blur(80px)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '40ch', margin: '0 auto', textAlign: 'center' }}>
            <motion.span
              style={{
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#c98a2b',
                marginBottom: 20,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              THE PEOPLE BEHIND STRESSSHIELD
            </motion.span>
            <motion.h1
              style={{
                fontFamily: 'Fraunces, serif',
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                color: '#fafafa',
                letterSpacing: '-0.03em',
                marginBottom: 20,
              }}
            >
              Meet the team
            </motion.h1>
            <motion.p
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                lineHeight: 1.7,
                color: '#a3a3a3',
                maxWidth: '50ch',
                margin: '0 auto',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              We\'re educators, clinicians, and builders who\'ve lived the stress of the classroom.
              Every feature we build comes from personal experience — and a shared belief that
              teachers deserve real support, not another to-do list.
            </motion.p>
          </div>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(16px, 3vw, 24px)',
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {TEAM_MEMBERS.map((member, index) => (
            <TeamCard key={member.name} member={member} index={index} />
          ))}
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.6 }}
          style={{ marginTop: 80, maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-block',
              fontSize: '0.65rem',
              fontWeight: '700',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 16,
              fontFamily: 'Inter, sans-serif',
            }}>
              OUR VALUES
            </span>
            <h2 style={{
              fontFamily: 'Fraunces, serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              letterSpacing: '-0.02em',
            }}>
              What guides us
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 'clamp(16px, 3vw, 24px)',
          }}>
            {[
              { icon: Shield, title: 'Privacy First', desc: 'Your data is yours. No ads, no tracking, no selling — ever.' },
              { icon: Heart, title: 'Teacher-Centered', desc: 'Every decision starts with: does this help a real teacher?' },
              { icon: Brain, title: 'Evidence-Based', desc: 'Built on psychology research, not wellness trends.' },
              { icon: Sparkles, title: 'Sustainable', desc: 'Small, consistent steps over dramatic transformations.' },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                style={{
                  padding: '28px 24px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  textAlign: 'center',
                  transition: 'transform 200ms ease, box-shadow 200ms ease',
                }}
                whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--accent-tint)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <value.icon size={26} />
                </div>
                <h3 style={{
                  fontFamily: 'Fraunces, serif',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  marginBottom: 8,
                }}>
                  {value.title}
                </h3>
                <p className="muted" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 1 }}
          style={{ marginTop: 80, textAlign: 'center', padding: '0 20px' }}
        >
          <p className="muted" style={{ marginBottom: 20, fontSize: '1rem' }}>
            Want to join us? We\'re always looking for people who care about teacher wellbeing.
          </p>
          <a
            href="mailto:careers@stressshield.app"
            className="btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', fontSize: '1.05rem' }}
          >
            Join the team <Sparkles size={18} />
          </a>
        </motion.div>
      </section>
    </Portal>
  );
}