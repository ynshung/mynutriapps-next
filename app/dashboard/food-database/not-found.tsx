import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-4 my-8 lg:m-8">
    <div className="flex flex-row gap-2 items-center">
      <span className="icon-[material-symbols--grocery] text-5xl mx-2"></span>
      <div>
        <h1 className="text-2xl font-bold">Food Database</h1>
        <p>Manage food items in the database.</p>
      </div>
    </div>

    <div className="flex flex-row flex-wrap gap-8 mt-4 p-4 bg-base-100 text-center rounded shadow justify-center items-center min-h-52">
      <div className="flex flex-row gap-2 items-center">
        <span className="icon-[material-symbols--error] text-4xl"></span>
        <p className="text-lg font-bold">No product found</p>
      </div>
      <div className="flex flex-col gap-2">
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/dashboard/food-database" className="btn btn-primary">
        <span className="icon-[material-symbols--first-page] text-3xl"></span>
        Return
      </a>
        <Link
          href="/dashboard/food-database/new-product"
          className="btn btn-primary transition"
          title="Add Product"
        >
          <span className="icon-[material-symbols--add] text-2xl"></span>
          Add Product
        </Link>
        <Link
          href="/dashboard/food-database/batch"
          className="btn btn-primary transition"
          title="Batch Add Product"
        >
          <span className="icon-[material-symbols--shadow-add] text-2xl"></span>
          Batch Add
        </Link>
      </div>
    </div>
  </main>

  )
}