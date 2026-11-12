const block = "animate-pulse rounded-lg bg-white/[0.06]";

/** Shown while the profile request is in flight. */
const ProfileSkeleton = () => (
  <div className="space-y-6" aria-hidden="true">
    {/* Page heading */}
    <div className="space-y-3">
      <div className={`${block} h-8 w-56`} />
      <div className={`${block} h-4 w-72 max-w-full`} />
    </div>

    <div className="grid gap-6 lg:grid-cols-3">
      {/* Photo card */}
      <div className="rounded-2xl border border-white/[0.09] bg-[#111218]/80 p-5 backdrop-blur-2xl sm:p-6">
        <div className="space-y-5">
          <div className={`${block} h-4 w-28`} />
          <div className={`${block} h-24 w-24 rounded-full`} />
          <div className={`${block} h-5 w-40`} />
          <div className={`${block} h-4 w-48 max-w-full`} />
          <div className={`${block} h-10 w-full`} />
        </div>
      </div>

      {/* Form cards */}
      <div className="space-y-6 lg:col-span-2">
        {[0, 1, 2].map((card) => (
          <div
            key={card}
            className="rounded-2xl border border-white/[0.09] bg-[#111218]/80 p-5 backdrop-blur-2xl sm:p-6"
          >
            <div className="space-y-5">
              <div className={`${block} h-5 w-40`} />
              <div className={`${block} h-4 w-full`} />
              <div className={`${block} h-12 w-full`} />
              <div className={`${block} h-12 w-full`} />
              <div className="flex justify-end gap-3">
                <div className={`${block} h-10 w-24`} />
                <div className={`${block} h-10 w-32`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProfileSkeleton;
