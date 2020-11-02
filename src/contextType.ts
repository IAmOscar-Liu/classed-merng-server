import { PubSub } from "apollo-server"

type ContextType = {
  req: any,
  pubSub: PubSub
}

export default ContextType;