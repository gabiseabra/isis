import {
  ComponentProps,
  ComponentType,
  createContext,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
  useContext,
  useState,
} from "react";
import { BiChevronDown, BiChevronLeft } from "react-icons/bi";
import { Link, LinkProps } from "react-router";
import { IconButton } from "../display/IconButton";
import { IconControl } from "../display/IconControl";
import { Spinner } from "../feedback/Spinner";
import * as css from "../utils/css";
import { Col, Row } from "./FlexBox";
import styles from "./Nav.module.scss";

type NavContext = {
  open: boolean;
};

const NavContext = createContext<NavContext>({
  open: true,
});

export type NavProps = ComponentProps<"nav"> & {
  collapsible?: boolean;
  loading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  header?: ReactNode;
  footer?: ReactNode;
};

export function Nav({
  collapsible,
  loading,
  open: controlledOpen,
  onOpenChange,
  header,
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
        data-loading={loading || undefined}
        data-collapsible={collapsible || undefined}
        className={[styles.Nav, className].filter(Boolean).join(" ")}
        {...props}
      >
        {collapsible && (
          <IconButton
            variant="solid"
            radius={1}
            title={open ? "Abrir menu" : "Fechar menu"}
            className={styles.CollapseButton}
            onClick={() => {
              setLocalOpen(!open);
              onOpenChange?.(!open);
            }}
          >
            <IconControl size="s" style={{ boxSizing: "content-box" }}>
              <BiChevronLeft />
            </IconControl>
          </IconButton>
        )}

        {header && <div className={styles.Header}>{header}</div>}

        <Col flex={1} alignX="stretch" alignY="start">
          {loading ? (
            <Col flex={1} alignX="center" alignY="center">
              <Spinner size="m" color="blue" />
            </Col>
          ) : (
            children
          )}
        </Col>

        {footer && <div className={styles.Footer}>{footer}</div>}
      </nav>
    </NavContext.Provider>
  );
}

export type NavItemProps = {
  as?: ComponentType<HTMLAttributes<HTMLElement>>;
  render?: (children: ReactNode) => ReactNode;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  loading?: boolean;
  collapsible?: boolean;
  active?: boolean;

  size?: "s" | "m" | "l" | "xl";
  color?: css.Color;
  title: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;

  className?: string;
  style?: CSSProperties;

  children?: ReactNode;
};

const DefaultNavItemElement = ({ children }: { children?: ReactNode }) => (
  <Row alignY="center">{children}</Row>
);

Nav.Item = function NavItem({
  as: Component,
  render,
  size = "s",
  loading,
  collapsible,
  active,
  color,
  title,
  icon,
  badge,
  open: controlledOpen,
  onOpenChange,
  className,
  children,
  style,
}: NavItemProps) {
  const nav = useContext(NavContext);
  const [localOpen, setLocalOpen] = useState(false);

  const open = controlledOpen ?? (nav.open && localOpen);

  Component ??= DefaultNavItemElement;
  render ??= (children) => <Component>{children}</Component>;
  collapsible ??= !!children;

  return (
    <Col
      alignX="stretch"
      className={[styles.Item, className].filter(Boolean).join(" ")}
      style={style}
      data-open={open || undefined}
      data-active={active || undefined}
      gap={0}
    >
      <Row
        className={styles.ItemTitle}
        alignY="center"
        data-color={color && color !== "default" ? color : undefined}
      >
        {render(
          <>
            <IconControl
              size={nav.open ? size : "s"}
              className={styles.ItemIcon}
            >
              {icon}
            </IconControl>

            <span className={styles.ItemText}>{title}</span>

            {badge && <span className={styles.ItemBadge}>{badge}</span>}
          </>,
        )}

        {loading ? (
          <IconControl mr={1} size="xs">
            <Spinner size="xs" color="muted" />
          </IconControl>
        ) : collapsible ? (
          <IconControl
            className={styles.ItemToggle}
            size="auto"
            p={0.75}
            style={{
              height: "calc(var(--nav-link-height) - 8px)",
              boxSizing: "border-box",
            }}
          >
            <IconButton
              radius={1}
              onClick={() => {
                setLocalOpen(!open);
                onOpenChange?.(!open);
              }}
            >
              <BiChevronDown />
            </IconButton>
          </IconControl>
        ) : null}
      </Row>

      {children && <Col className={styles.ItemContent}>{children}</Col>}
    </Col>
  );
};

export type NavLinkProps = Omit<LinkProps, "color" | "title"> & {
  size?: "s" | "m" | "l" | "xl";
  loading?: boolean;
  collapsible?: boolean;
  active?: boolean;
  title: ReactNode;
  color?: css.Color;
  icon?: ReactNode;
  badge?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

Nav.Link = function NavLink({
  size,
  loading,
  collapsible,
  active,
  title,
  color,
  icon,
  badge,
  open,
  onOpenChange,
  children,
  ...props
}: NavLinkProps) {
  return (
    <Nav.Item
      {...{
        size,
        loading,
        collapsible,
        active,
        title,
        color,
        icon,
        badge,
        open,
        onOpenChange,
      }}
      render={(content) => <Link {...props}>{content}</Link>}
    >
      {children}
    </Nav.Item>
  );
};

export type NavButtonProps = Omit<
  ComponentProps<"button">,
  "color" | "title"
> & {
  size?: "s" | "m" | "l" | "xl";
  loading?: boolean;
  collapsible?: boolean;
  active?: boolean;
  title: ReactNode;
  color?: css.Color;
  icon?: ReactNode;
  badge?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

Nav.Button = function NavButton({
  size,
  loading,
  collapsible,
  active,
  title,
  color,
  icon,
  badge,
  open,
  onOpenChange,
  children,
  ...props
}: NavButtonProps) {
  return (
    <Nav.Item
      {...{
        size,
        loading,
        collapsible,
        active,
        title,
        color,
        icon,
        badge,
        open,
        onOpenChange,
      }}
      render={(content) => <button {...props}>{content}</button>}
    >
      {children}
    </Nav.Item>
  );
};
