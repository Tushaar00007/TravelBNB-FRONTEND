function CategoryRow() {

    const categories = [
        "Beach",
        "Mountain",
        "City",
        "Cabins",
        "Luxury",
        "Trending",
        "Pools",
        "Farmhouses"
    ]

    return (

        <div className="flex gap-6 overflow-x-auto px-10 py-4 border-b bg-white">

            {categories.map((cat) => (

                <div
                    key={cat}
                    className="px-5 py-2 border rounded-full cursor-pointer hover:bg-orange-100 whitespace-nowrap"
                >
                    {cat}
                </div>

            ))}

        </div>

    )

}

export default CategoryRow