import type { Meta, StoryObj } from "@storybook/react";
import { FaBook, FaCannabis, FaHome } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { TbUfoFilled } from "react-icons/tb";
import { createHashRouter, Outlet, RouterProvider } from "react-router";
import { Avatar } from "../display/Avatar";
import { Badge } from "../display/Badge";
import { Logo } from "../display/Logo";
import { Text } from "../display/Text";
import { Card } from "./Card";
import { Col, Row } from "./FlexBox";
import { Nav } from "./Nav";

const meta: Meta = {
  title: "Layout/Nav",
  decorators: [
    (Story) => (
      <RouterProvider
        router={createHashRouter([
          {
            element: (
              <Row
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              >
                <Story />
                <Col asChild flex={1} alignX="center" alignY="center">
                  <Card m={2}>
                    <Outlet />
                  </Card>
                </Col>
              </Row>
            ),
            children: [
              {
                index: true,
                element: <Text>/</Text>,
              },
              {
                path: "/profile",
                element: <Text>Olá, Fulaninho</Text>,
              },
              {
                path: "/posts",
                element: <Text>/posts</Text>,
              },
              {
                path: "/settings",
                element: <Outlet />,
                children: [
                  {
                    index: true,
                    element: <Text>/settings</Text>,
                  },
                  {
                    path: "/settings/eyy",
                    element: <Text>/settings/eyy</Text>,
                  },
                  {
                    path: "/settings/lmao",
                    element: <Text>/settings/lmao</Text>,
                  },
                ],
              },
            ],
          },
        ])}
      />
    ),
  ],
};

type Story = StoryObj;

export default meta;

export const Default: Story = {
  render: () => (
    <Nav
      collapsible
      footer={
        <Nav.Link
          size="l"
          to="/profile"
          icon={
            <Avatar size="l" src="https://cataas.com/cat" title="Fulaninho" />
          }
          title="Olá, Fulaninho"
        />
      }
    >
      <Nav.Item
        size="l"
        icon={<Logo />}
        title={
          <Col gap={0}>
            <Text>Title</Text>
            <Text size="caption">subtitle</Text>
          </Col>
        }
      />
      <Nav.Link to="/" icon={<FaHome />} title="Dashboard" />
      <Nav.Link to="/posts" icon={<FaBook />} title="Publications" />
      <Nav.Link to="/settings" icon={<FaGear />} title="Settings">
        <Nav.Link
          to="/settings/eyy"
          icon={<TbUfoFilled />}
          badge={
            <Badge size="m" color="green">
              420
            </Badge>
          }
          title="Eyy"
        />
        <Nav.Link to="/settings/lmao" icon={<FaCannabis />} title="Lmao" />
      </Nav.Link>
    </Nav>
  ),
};
