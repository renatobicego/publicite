
import { Button, Link } from "@nextui-org/react";
import SubscriptionsPlans from "./SubscriptionsPlans";

export default function Page() {

    return (
        <div>
            <h1>Subscripcion</h1>
            <SubscriptionsPlans />
            <Button as={Link} href="">
                Pagar Plan
            </Button>
        </div>
    );
}