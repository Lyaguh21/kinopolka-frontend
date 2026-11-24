import { Flex } from "@mantine/core";
import { Outlet, useNavigate } from "react-router";
import { useSession } from "../../entities/session";
import { MobileNavigation, SiteFooter, SiteHeader } from "../../shared/ui";
import classes from "./AppLayout.module.css";

export function AppLayout({ onSearch }: { onSearch: () => void }) {
  const account = useSession((state) => state.account);
  const signOut = useSession((state) => state.signOut);
  const navigate = useNavigate();

  async function leaveAccount() {
    if(await signOut())navigate("/");
  }

  return (
    <Flex className={classes.layout} direction="column" mih="100svh">
      <SiteHeader
        account={account}
        onSearch={onSearch}
        onSignOut={leaveAccount}
      />
      <Flex direction="column" flex={1} miw={0}>
        <Outlet />
      </Flex>
      <SiteFooter />
      <MobileNavigation account={account} onSignOut={leaveAccount} />
    </Flex>
  );
}
