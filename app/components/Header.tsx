export const Header = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <>{subtitle}</>}
      </div>
    </div>
  );
};
