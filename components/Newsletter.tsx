import Title from "./Title";

export default function Newsletter() {
  return (
    <div className="flex flex-col items-center mx-4 my-36">
      <Title
        title="Join Newsletter"
        description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week."
        visibleButton={false}
      />
      <div className="flex bg-slate-100 dark:bg-slate-800 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white dark:border-slate-700 ring ring-slate-200 dark:ring-slate-850 transition-colors">
        <input
          className="flex-1 pl-5 outline-none bg-transparent text-slate-900 dark:text-white placeholder-slate-550 dark:placeholder-slate-400"
          type="text"
          placeholder="Enter your email address"
        />
        <button className="font-medium bg-green-500 hover:bg-green-600 text-white px-2 py-1 sm:px-7 sm:py-3 rounded-full hover:scale-103 active:scale-95 transition-all">
          Get Updates
        </button>
      </div>
    </div>
  );
}
