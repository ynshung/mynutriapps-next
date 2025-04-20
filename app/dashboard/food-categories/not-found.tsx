export default function NotFound() {
  return (
    <main className="mx-4 my-8 lg:m-8">
    <div className="flex flex-row gap-2 items-center">
      <span className="icon-[material-symbols--category] text-5xl mx-2"></span>
      <div>
        <h1 className="text-2xl font-bold">Food Categories</h1>
        <p>Manage food categories in the database.</p>
      </div>
    </div>

    <div className="flex flex-col flex-wrap gap-4 mt-4 p-4 bg-base-100 text-center rounded shadow justify-center items-center min-h-52">
      <div className="flex flex-row gap-2 items-center">
        <span className="icon-[material-symbols--error] text-4xl"></span>
        <p className="text-lg font-bold">No product categories found</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/dashboard/food-categories" className="btn btn-primary">
        <span className="icon-[material-symbols--first-page] text-3xl"></span>
        Return
      </a>
    </div>
  </main>

  )
}