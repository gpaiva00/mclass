import { Outlet } from "react-router";

import { Navbar } from "@/components";

function DefaultLayout() {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex justify-between items-center px-6">
        <Navbar />
      </div>

      <main className="md:px-64 px-6 py-8">
        <Outlet />
      </main>

      {/* <Footer /> */}
    </div>
  );
}

export default DefaultLayout;
