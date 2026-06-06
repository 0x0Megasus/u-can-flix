import CategoryPage from "@/_components/CategoryPage";

export const revalidate = 21600;

export const metadata = {
  title: "TV Shows",
  description: "Browse and stream free TV shows online in HD at U Can Flix.",
  alternates: { canonical: "/tv-shows" },
  openGraph: {
    title: "TV Shows - U Can Flix",
    description: "Browse and stream free TV shows online in HD at U Can Flix.",
    url: "/tv-shows",
  },
};

export default function TVPage() {
  return <CategoryPage filter="tv" label="TV Shows" />;
}
