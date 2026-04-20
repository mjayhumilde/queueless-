type Props = { queueId: string; queue: any };

export default function JoinedCard({ queueId, queue }: Props) {
  const ahead = queue.myNumber - queue.current;
  const isUp = ahead <= 0;

  return (
    <div className="bg-white border border-brand-complementary/12 rounded-2xl p-4 mb-3 flex items-center gap-4">
      <div
        className={`text-5xl font-black leading-none shrink-0 ${isUp ? "text-brand-tertiary" : "text-brand-complementary"}`}
      >
        {queue.myNumber}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-brand-complementary text-[13px] truncate mb-1">
          {queue.name}
        </p>
        <p className="text-[11px] text-brand-complementary/50 mb-2">
          Now serving:{" "}
          <strong className="text-brand-complementary">
            {queue.current === 0 ? "—" : queue.current}
          </strong>
        </p>
        {isUp ? (
          <span className="inline-block text-[11px] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
            You're up!
          </span>
        ) : (
          <span className="text-[11px] font-bold text-brand-tertiary">
            {ahead} {ahead === 1 ? "person" : "people"} ahead
          </span>
        )}
      </div>
    </div>
  );
}
