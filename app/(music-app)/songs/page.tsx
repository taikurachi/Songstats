export default function SongsDefault() {
  return (
    <div className="col-start-2 row-start-2">
      <h1 className="text-3xl font-bold mb-6">Home</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition cursor-pointer">
          <h2 className="text-xl font-bold mb-2">Recently Played</h2>
          <p className="text-gray-400">Your recently played tracks</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition cursor-pointer">
          <h2 className="text-xl font-bold mb-2">Made For You</h2>
          <p className="text-gray-400">Your personalized playlists</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700 transition cursor-pointer">
          <h2 className="text-xl font-bold mb-2">Popular Albums</h2>
          <p className="text-gray-400">Top albums right now</p>
        </div>
      </div>
    </div>
  );
}
