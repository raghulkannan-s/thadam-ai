import { useRouter } from "next/navigation";

export function useTakeoffNavigation() {
  const router = useRouter();

  const handleTakeoff = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    window.dispatchEvent(new Event("thadam-takeoff"));
    
    // We wait 3.5 seconds for the cinematic full-screen sweep to complete
    setTimeout(() => {
      router.push(href);
    }, 3500);
  };

  return handleTakeoff;
}
