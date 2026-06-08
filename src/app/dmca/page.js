export const revalidate = 43200;

export const metadata = {
  title: 'DMCA Takedown',
  description: 'DMCA takedown request requirements and copyright infringement reporting for U Can Flix.',
  alternates: { canonical: '/dmca' },
  openGraph: {
    title: 'DMCA Takedown - U Can Flix',
    description: 'DMCA takedown request requirements and copyright infringement reporting for U Can Flix.',
    url: '/dmca',
  },
}

export default function DMCAPage() {
  return (
    <section className="pt-[100px] md:pt-[80px] pb-16 max-w-4xl mx-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-8 tracking-tight">DMCA Takedown Request Requirements</h1>

        <div className="space-y-5 text-[var(--text-secondary)] leading-relaxed text-sm">
          <p>
            Our streaming website provides links to content hosted by third-party sites.
            We do not host any of the movies or other content ourselves, and we do not
            have control over the content hosted on these third-party sites. We simply
            provide links to these sites as a service to our users.
          </p>

          <p>
            We take the intellectual property rights of others seriously and require that
            our users do the same. The Digital Millennium Copyright Act (DMCA) established
            a process for addressing claims of copyright infringement. If you own a copyright
            or have authority to act on behalf of a copyright owner and want to report a claim
            that a third party is infringing that material please submit a DMCA report via email
            and we will take appropriate action.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 mt-12 tracking-tight">DMCA Report Requirements</h2>

        <ul className="text-[var(--text-secondary)] space-y-4 text-sm leading-relaxed">
          {[
            'A description of the copyrighted work that you claim is being infringed.',
            'A description of the material you claim is infringing and that you want removed or access to which you want disabled with a URL and proof you are the original owner or other location of that material.',
            'Your name, title (if acting as an agent), address, telephone number, and email address.',
            'The following statement: "I have a good faith belief that the use of the copyrighted material I am complaining of is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)."',
            'The following statement: "The information in this notice is accurate and, under penalty of perjury, I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right that is allegedly infringed."',
            'The following statement: "I understand that I am subject to legal action upon submitting a DMCA request without solid proof."',
            'An electronic or physical signature of the owner of the copyright or a person authorized to act on the owner\'s behalf.',
          ].map((text, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-[var(--accent)] font-bold shrink-0 mt-0.5">{i + 1}.</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 p-5 rounded-[var(--radius-md)] bg-[var(--bg-tertiary)] border border-[var(--border-default)]">
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            Please send your DMCA takedown notice to us. We will promptly investigate and
            take appropriate action in accordance with the DMCA.
          </p>
          <p className="text-[var(--text-secondary)] text-sm mt-4 leading-relaxed">
            Thank you for your cooperation.
          </p>
        </div>
      </div>
    </section>
  )
}
