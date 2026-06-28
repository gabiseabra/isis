import { Avatar } from "@isis/ui/display/Avatar";
import { IconControl } from "@isis/ui/display/IconControl";
import { Logo } from "@isis/ui/display/Logo";
import { Text } from "@isis/ui/display/Text";
import { Col } from "@isis/ui/layout/FlexBox";
import { Nav } from "@isis/ui/layout/Nav";
import { Tooltip } from "@isis/ui/overlay/Tooltip";
import { useQuery } from "@tanstack/react-query";
import { ReactNode } from "react";
import { HiLogout } from "react-icons/hi";
import { useNavigate } from "react-router";
import { useLocalStorage } from "usehooks-ts";
import { clearToken, orpcQuery, queryClient } from "../../orpc/client";

const NAV_OPEN_KEY = "isis-nav-open";

export function Layout({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useLocalStorage(NAV_OPEN_KEY, true);
  const userQuery = useQuery(orpcQuery.users.me.queryOptions());
  const navigate = useNavigate();

  return (
    <>
      <Nav
        collapsible={!!userQuery.data}
        open={!!userQuery.data && navOpen}
        onOpenChange={setNavOpen}
        footer={
          userQuery.data && (
            <Nav.Item
              size="l"
              icon={<Avatar size="auto" title={userQuery.data.name} />}
              title={userQuery.data.name}
              badge={
                <Tooltip
                  sideOffset={2}
                  content={<Text size="caption">Sair</Text>}
                >
                  <IconControl
                    size="m"
                    as="button"
                    color="red"
                    onClick={() => {
                      clearToken();
                      queryClient.invalidateQueries({
                        queryKey: orpcQuery.users.me.queryKey(),
                      });
                      navigate("/login");
                    }}
                  >
                    <HiLogout />
                  </IconControl>
                </Tooltip>
              }
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
