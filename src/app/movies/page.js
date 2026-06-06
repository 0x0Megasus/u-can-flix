import CategoryPage from "@/_components/CategoryPage";

export const revalidate = 21600;

export const metadata = {
  title: "Movies",
  description: "Browse and stream free movies online in HD at U Can Flix.",
  alternates: { canonical: "/movies" },
  openGraph: {
    title: "Movies - U Can Flix",
    description: "Browse and stream free movies online in HD at U Can Flix.",
    url: "/movies",
  },
};

export default function MoviesPage() {
  return <CategoryPage filter="movies" label="Movies" />;
}
