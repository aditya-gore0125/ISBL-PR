import StoreInfoPage from '@/components/StoreInfoPage';

export function generateMetadata() {
  return {
    title: 'About Us',
    description: 'Learn about Nandini Jewellers and our approach to modern jewelry.',
  };
}

export default function AboutPage() {
  return (
    <StoreInfoPage
      eyebrow="Our story"
      title="Jewelry for the moments that become memories."
      intro="Nandini Jewellers brings together expressive design and pieces made to feel at home in everyday life and special celebrations."
    >
      <section>
        <h2 className="font-fraunces text-2xl text-charcoal">A considered collection</h2>
        <p className="mt-3">We believe the right piece can make a familiar ritual feel a little more personal. Our collection spans delicate everyday accents and statement styles for celebrations, gifting, and everything between.</p>
      </section>
      <section>
        <h2 className="font-fraunces text-2xl text-charcoal">Made to be worn your way</h2>
        <p className="mt-3">Explore by category, discover a new favorite, and choose the pieces that feel like you. We are building a jewelry experience that is easy to browse, thoughtful to give, and a pleasure to wear.</p>
      </section>
    </StoreInfoPage>
  );
}