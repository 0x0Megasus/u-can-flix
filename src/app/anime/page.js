import CategoryPage from "@/_components/CategoryPage";

export const revalidate = 21600;

export const metadata = {
  title: "Anime",
  description: "Browse and stream free anime online in HD at U Can Flix.",
  alternates: { canonical: "/anime" },
  openGraph: {
    title: "Anime - U Can Flix",
    description: "Browse and stream free anime online in HD at U Can Flix.",
    url: "/anime",
  },
};

export default function AnimePage() {
  return <CategoryPage filter="anime" label="Anime" />;
}
