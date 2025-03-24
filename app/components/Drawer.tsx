"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { auth } from "../lib/client";
import { signOut } from "firebase/auth";
import { getDatabaseStatus } from "./DatabaseStatus";

interface RowProps {
  link: string;
  text: string;
  icon?: ReactNode;
}

const Row: React.FC<RowProps> = ({ link, text, icon }) => {
  const pathname = usePathname();

  return (
    <li>
      <Link
        className={`flex flex-row items-center py-3 gap-3 ${
          pathname === link ? "bg-primary" : ""
        }`}
        href={link}
      >
        {icon}
        {text}
      </Link>
    </li>
  );
};
interface DrawerProps {
  children: ReactNode;
}

export default function Drawer({ children }: DrawerProps) {
  const router = useRouter();

  const [databaseStatus, setDatabaseStatus] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // TODO - auto refresh status, add server
    const checkDatabaseStatus = async () => {
      const status = await getDatabaseStatus();
      setDatabaseStatus(status);
    };

    checkDatabaseStatus();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    await fetch("/api/logout");
    router.push("/login");
  }

  return (
    <div className="drawer drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{children}</div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-2"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-[#202020] min-h-full w-64 p-4 pt-8 gap-8 text-white justify-between">
          <div className="gap-8 flex flex-col">
            <Image
              src="/mna-dvt.png"
              alt="Logo of MyNutriApps"
              width={128}
              height={56.359}
              className="self-center"
            />
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2 items-center justify-center">
                <div className="inline-grid *:[grid-area:1/1]">
                  <div className={`status ${databaseStatus ? 'status-success' : 'status-error'} animate-ping`}></div>
                  <div className={`status ${databaseStatus ? 'status-success' : 'status-error'}`}></div>
                </div>
                {databaseStatus === null ? "Checking..." : databaseStatus ? "Database is up" : "Database unreachable"}
              </div>
              <Row
                link="/dashboard"
                text="Dashboard"
                icon={
                  <span className="icon-[material-symbols--dashboard] text-2xl"></span>
                }
              />
              <Row
                link="/dashboard/food-database"
                text="Food Database"
                icon={
                  <span className="icon-[material-symbols--grocery] text-2xl"></span>
                }
              />
              <Row
                link="/dashboard/food-categories"
                text="Food Categories"
                icon={
                  <span className="icon-[material-symbols--category] text-2xl"></span>
                }
              />
              <Row
                link="/dashboard/user-reports"
                text="User Reports"
                icon={
                  <span className="icon-[material-symbols--feedback] text-2xl"></span>
                }
              />
              <Row
                link="/dashboard/dev"
                text="Developer Tools"
                icon={
                  <span className="icon-[material-symbols--logo-dev] text-2xl"></span>
                }
              />
            </div>
          </div>
          <li>
            <button
              className={`flex flex-row items-center py-3 gap-3`}
              onClick={handleLogout}
            >
              <span className="icon-[material-symbols--logout] text-2xl"></span>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
