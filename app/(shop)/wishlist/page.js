import WishlistClient from '@/components/WishlistClient';

export const metadata = {
  title: 'My Wishlist | Nandini Jewellers',
  description: 'Your saved favorite jewelry pieces.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return <WishlistClient />;
}

