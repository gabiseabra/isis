import { Divider } from "@isis/ui/display/Divider";
import { Logo } from "@isis/ui/display/Logo";
import { Col } from "@isis/ui/layout/FlexBox";
import { Nav } from "@isis/ui/layout/Nav";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import { BiSolidPen } from "react-icons/bi";
import { BsImages } from "react-icons/bs";
import { HiLogout } from "react-icons/hi";
import { ImBook, ImBooks } from "react-icons/im";
import { clearToken, orpcQuery, queryClient } from "../../orpc/client";

const NAV_OPEN_KEY = "isis-nav-open";
const BOOKS_OPEN_KEY = "isis-nav-open:books";

export function Layout({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useLocalStorage({
    key: NAV_OPEN_KEY,
    defaultValue: true,
  });
  const [booksOpen, setBooksOpen] = useLocalStorage({
    key: BOOKS_OPEN_KEY,
    defaultValue: true,
  });
  const userQuery = useQuery(orpcQuery.users.me.queryOptions());

  return (
    <>
      <Nav
        collapsible={userQuery.isSuccess}
        open={userQuery.isSuccess && navOpen}
        onOpenChange={setNavOpen}
        footer={
          userQuery.isSuccess && (
            <Nav.Link
              to="/login"
              color="red"
              icon={<HiLogout style={{ transform: "scaleX(-1)" }} />}
              title="Logout"
              onClick={() => {
                clearToken();
                queryClient.resetQueries({
                  queryKey: orpcQuery.users.me.queryKey(),
                });
              }}
            />
          )
        }
      >
        <Nav.Item icon={<Logo />} title="Biblioteca Isis" />

        <Divider mx={1} my={1} />

        <Nav.Link
          to="/books"
          icon={<ImBooks />}
          title="Acervo"
          open={booksOpen}
          onOpenChange={setBooksOpen}
        >
          <Nav.Link to="/publishers" icon={<ImBook />} title="Editoras" />
          <Nav.Link to="/authors" icon={<BiSolidPen />} title="Autores" />
        </Nav.Link>

        <Nav.Link to="/media" icon={<BsImages />} title="Mídia" />
      </Nav>

      <Col asChild flex={1} alignX="center" alignY="center">
        <main>{children}</main>
      </Col>
    </>
  );
}
