import { Logo } from "@isis/ui/display/Logo";
import { Col } from "@isis/ui/layout/FlexBox";
import { Nav } from "@isis/ui/layout/Nav";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import { HiLogout } from "react-icons/hi";
import { useLocalStorage } from "usehooks-ts";
import { clearToken, orpcQuery, queryClient } from "../../orpc/client";

const NAV_OPEN_KEY = "isis-nav-open";

export function Layout({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useLocalStorage(NAV_OPEN_KEY, true);
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
      </Nav>

      <Col as="main" flex={1} alignX="center" alignY="center">
        {children}
      </Col>
    </>
  );
}
