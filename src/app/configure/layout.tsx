import MaxWidthWrapper from "@/components/maxWidthWrapper";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MaxWidthWrapper className="flex flex-1 flex-col">
      {children}
    </MaxWidthWrapper>
  );
};

export default Layout;
