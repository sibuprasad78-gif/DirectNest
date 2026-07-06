type StatsProps = {
  totalProperties: number;
};

export default function Stats({ totalProperties }: StatsProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <div className="bg-blue-600 text-white rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-4xl font-bold">{totalProperties}+</h2>
            <p className="mt-2">Properties</p>
          </div>

          <div className="bg-green-600 text-white rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-4xl font-bold">100%</h2>
            <p className="mt-2">No Brokerage</p>
          </div>

          <div className="bg-orange-500 text-white rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-4xl font-bold">24×7</h2>
            <p className="mt-2">Owner Contact</p>
          </div>

          <div className="bg-purple-600 text-white rounded-2xl p-8 text-center shadow-lg">
            <h2 className="text-4xl font-bold">Fast</h2>
            <p className="mt-2">Visit Booking</p>
          </div>

        </div>
      </div>
    </section>
  );
}