import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useState,
} from "react";
import { BiChevronDown, BiChevronLeft } from "react-icons/bi";
import { Link, LinkProps } from "react-router";
import { IconControl } from "../display/IconControl";
import { Span, Text } from "../display/Text";
import { Col, Row } from "./FlexBox";
import styles from "./Nav.module.scss";

type NavContext = {
  open: boolean;
};

const NavContext = createContext<NavContext>({
  open: true,
});

export type NavProps = ComponentProps<"nav"> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  footer?: ReactNode;
};

export function Nav({
  open: controlledOpen,
  onOpenChange,
  footer,
  children,
  className,
  ...props
}: NavProps) {
  const [localOpen, setLocalOpen] = useState(true);

  const open = controlledOpen ?? localOpen;

  return (
    <NavContext.Provider value={{ open }}>
      <nav
        data-open={open || undefined}
        className={[styles.Nav, className].filter(Boolean).join(" ")}
        {...props}
      >
        <IconControl
          as="button"
          size="s"
          radius={1}
          title={open ? "Abrir menu" : "Fechar menu"}
          className={styles.CollapseButton}
          onClick={() => {
            setLocalOpen(!open);
            onOpenChange?.(!open);
          }}
        >
          <BiChevronLeft />
        </IconControl>

        <Col alignY="space-between" style={{ height: "100%" }}>
          <Col className={styles.Content}>{children}</Col>

          <div className={styles.Footer}>{footer}</div>
        </Col>
      </nav>
    </NavContext.Provider>
  );
}

export type NavGroupProps = ComponentProps<"div"> & {
  title: ReactNode;
  badge?: ReactNode;
};

Nav.Group = function NavGroup({
  title,
  badge,
  children,
  className,
  ...props
}: NavGroupProps) {
  return (
    <div
      className={[styles.Group, className].filter(Boolean).join(" ")}
      {...props}
    >
      <Row alignX="space-between">
        <Text size="caption">
          <Span bold>{title}</Span>
        </Text>

        {badge}
      </Row>

      <div className={styles.GroupContent}>{children}</div>
    </div>
  );
};

export type NavItemProps = LinkProps & {
  size?: "s" | "m" | "l" | "xl";
  title: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

Nav.Item = function NavItem({
  size = "s",
  title,
  icon,
  badge,
  open: controlledOpen,
  onOpenChange,
  className,
  children,
  ...props
}: NavItemProps) {
  const nav = useContext(NavContext);
  const [localOpen, setLocalOpen] = useState(false);

  const open = controlledOpen ?? (nav.open && localOpen);

  return (
    <Col
      alignX="stretch"
      className={[styles.Item, className].filter(Boolean).join(" ")}
      data-open={open || undefined}
    >
      <Row className={styles.Link} alignY="center">
        <Link {...props}>
          <IconControl size={nav.open ? size : "s"} className={styles.LinkIcon}>
            {icon}
          </IconControl>

          <span className={styles.LinkText}>{title}</span>

          {badge && <span className={styles.LinkBadge}>{badge}</span>}
        </Link>

        {children && (
          <IconControl
            as="button"
            size="auto"
            mr={1}
            p={0.75}
            radius={1}
            style={{
              height: "calc(var(--nav-link-height) - 8px)",
              boxSizing: "border-box",
            }}
            onClick={() => {
              setLocalOpen(!open);
              onOpenChange?.(!open);
            }}
          >
            <BiChevronDown />
          </IconControl>
        )}
      </Row>

      {children && <Col className={styles.ItemContent}>{children}</Col>}
    </Col>
  );
};
