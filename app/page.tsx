import Image from "next/image";
import LoginComponent from "./components/LoginComponent";
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Admin Login',
};

export default function Home() {
  return (
    <main>\
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="border border-gray-200 bg-base-100 shadow p-8 m-8 rounded-lg flex flex-col gap-4">
          <Image
            src="/mna-lht.png"
            alt="Logo of MyNutriApps"
            width={256}
            height={64}
          />
          <h1 className="text-xl font-bold font-montserrat text-center">Admin Login</h1>
          <LoginComponent />
        </div>
      </div>
    </main>
  );
}
