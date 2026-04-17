type Props = {
  queueId: string;
  queue: any;
};

export default function JoinedCard({ queueId, queue }: Props) {
  const ahead = queue.myNumber - queue.current;

  return (
    <div className="border rounded p-4 mb-3">
      <p className="font-bold">{queue.name}</p>
      <p className="text-sm text-gray-500">
        Your number: <strong>{queue.myNumber}</strong> · Now serving:{" "}
        <strong>{queue.current}</strong>
      </p>
      <p className="text-sm mt-1">
        {ahead > 0 ? (
          <span className="text-yellow-600">{ahead} people ahead of you</span>
        ) : (
          <span className="text-green-600 font-semibold">You're up!</span>
        )}
      </p>
    </div>
  );
}
