import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import TrackClicks from "@/components/TrackClicks";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pb-24 lg:pb-0">{children}</main>
      <Footer />
      <FloatingCTA />
      <TrackClicks />
    </>
  );
}
