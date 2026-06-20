

const Loader = ({ type = 'page' }) => {
  if (type === 'card') {
    return (
      <div className="animate-pulse bg-white/5 border border-white/10 rounded-lg overflow-hidden h-[400px]">
        <div className="bg-white/10 h-[60%] w-full"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
          <div className="h-10 bg-white/10 rounded w-full mt-4"></div>
        </div>
      </div>
    );
  }

  if (type === 'hero') {
    return <div className="animate-pulse bg-white/5 h-screen w-full"></div>;
  }

  // Default page loader
  return (
    <div className="min-h-[50vh] flex flex-col justify-center items-center gap-6">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-accent h-12 w-12"></div>
      </div>
      <div className="h-4 bg-white/10 rounded w-48 animate-pulse"></div>
    </div>
  );
};

export default Loader;
