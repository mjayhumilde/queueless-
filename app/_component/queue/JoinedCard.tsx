type Props = { queueId: string; queue: any };

export default function JoinedCard({ queueId, queue }: Props) {
  const ahead = queue.myNumber - queue.current;

  return (
    <div className="bg-white border border-brand-complementary/20 rounded-xl p-4 mb-3 shadow-sm">
      <p className="font-bold text-brand-complementary">{queue.name}</p>
      <div className="flex gap-3 mt-2">
        <span className="text-xs bg-brand-secondary text-brand-complementary px-2 py-0.5 rounded-full font-medium">
          Your number: {queue.myNumber}
        </span>
        <span className="text-xs bg-brand-main border border-brand-complementary/20 text-brand-complementary px-2 py-0.5 rounded-full font-medium">
          Serving: {queue.current === 0 ? "—" : queue.current}
        </span>
      </div>
      <p className="text-sm mt-2">
        {ahead > 0 ? (
          <span className="text-brand-tertiary font-medium">
            {ahead} people ahead of you
          </span>
        ) : (
          <span className="text-green-700 font-semibold">You're up!</span>
        )}
      </p>
    </div>
  );
}
