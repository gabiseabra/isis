import type { Meta, StoryObj } from "@storybook/react";
import { FaBook, FaCannabis } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { TbUfoFilled } from "react-icons/tb";
import { createHashRouter, Outlet, RouterProvider } from "react-router";
import { Avatar } from "../display/Avatar";
import { Badge } from "../display/Badge";
import { Text } from "../display/Text";
import { Card } from "./Card";
import { Row } from "./FlexBox";
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
                <Card alignX="center" alignY="center" flex={1} m={2}>
                  <Outlet />
                </Card>
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
      footer={
        <Nav.Item
          size="l"
          to="/profile"
          icon={
            <Avatar size="l" src="https://cataas.com/cat" title="Fulaninho" />
          }
          title="Olá, Fulaninho"
        />
      }
    >
      <Nav.Item to="/" icon={<FaBook />} title="Dashboard" />
      <Nav.Item to="/posts" icon={<FaBook />} title="Posts" />
      <Nav.Item to="/settings" icon={<FaGear />} title="Settings">
        <Nav.Item
          to="/settings/eyy"
          icon={<TbUfoFilled />}
          badge={
            <Badge size="m" color="green">
              420
            </Badge>
          }
          title="Eyy"
        />
        <Nav.Item to="/settings/lmao" icon={<FaCannabis />} title="Lmao" />
      </Nav.Item>
    </Nav>
  ),
};
