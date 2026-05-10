import { Link } from 'react-router-dom'

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-brand/10 to-brand-light/10 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold font-bold text-gray-800 mb-6">About Us</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Over a decade of focus on plush toy manufacturing — delivering quality, safety, and creativity to customers worldwide.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-extrabold font-bold text-gray-800 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                DolphineShow. Monnca was founded in 2010 in Yiwu, Zhejiang Province, China — the global hub of small commodity trade.
                Over more than a decade of growth, we have evolved into a comprehensive plush toy enterprise integrating design, development, production, and sales.
              </p>
              <p>
                We operate a modern manufacturing facility equipped with advanced cutting, sewing, stuffing, and packaging machinery,
                with a monthly production capacity exceeding 500,000 units. Our team of 300+ employees includes a dedicated design team of 20 professionals,
                enabling us to respond quickly to customized client requirements.
              </p>
              <p>
                "Quality First, Innovation at Heart" is the philosophy we have always upheld. Every plush toy undergoes rigorous quality inspection
                to ensure it is safe, soft, and comforting — bringing warmth and joy to children around the world.
              </p>
            </div>
          </div>
          <div className="bg-brand-light/20 rounded-3xl p-8 flex items-center justify-center aspect-square">
            <span className="text-[120px]">🏭</span>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold font-bold text-gray-800 text-center mb-10">Certifications & Compliance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🛡️', title: 'CE Certified', desc: 'EU Safety Standard' },
              { icon: '✅', title: 'CPC Certified', desc: 'US Children\'s Product Safety' },
              { icon: '🏅', title: 'ASTM F963', desc: 'US Toy Safety Standard' },
              { icon: '🌿', title: 'ISO 9001', desc: 'Quality Management System' },
              { icon: '🔬', title: 'EN 71', desc: 'European Toy Safety Standard' },
              { icon: '🏭', title: 'BSCI', desc: 'Business Social Compliance Initiative' },
              { icon: '♻️', title: 'Oeko-Tex', desc: 'Textile Safety Certification' },
              { icon: '🎯', title: 'Disney FAMA', desc: 'Disney Factory Audit' },
            ].map((cert) => (
              <div key={cert.title} className="bg-cream rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">{cert.icon}</div>
                <h3 className="font-bold text-gray-700">{cert.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold font-bold text-gray-800 text-center mb-10">Why Choose Us</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🎨', title: 'In-House Design Team', desc: 'A team of 20 professional designers launching 30+ new styles monthly, supporting custom design from your artwork or samples.' },
            { icon: '🏭', title: 'Strong Production Capacity', desc: 'Modern factory with 500,000+ units/month capacity. Reliable lead times with rush order capability.' },
            { icon: '💰', title: 'Highly Competitive Pricing', desc: 'Direct from factory — eliminating middlemen to offer the best value for B2B buyers.' },
            { icon: '🔒', title: 'Strict Quality Control', desc: 'Full-process inspection from raw materials to finished goods. Return rate below 0.5%.' },
            { icon: '🌍', title: 'Global Export Experience', desc: 'Products exported to 50+ countries with in-depth knowledge of international safety standards and import requirements.' },
            { icon: '🤝', title: 'Dedicated After-Sales Service', desc: 'Dedicated account manager for every client. Responses within 24 hours with full order tracking.' },
          ].map((adv) => (
            <div key={adv.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{adv.icon}</div>
              <h3 className="font-bold text-gray-700 mb-2">{adv.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{adv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-brand-light/30 to-accent/10 py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-4 text-gray-800">Ready to Work Together?</h2>
          <p className="text-gray-500 mb-8">Tell us your requirements and our professional team will get back to you within 24 hours.</p>
          <Link to="/inquiry" className="inline-block px-10 py-4 bg-brand text-white font-bold rounded-full hover:shadow-lg hover:shadow-brand/25 transition-all">
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  )
}
