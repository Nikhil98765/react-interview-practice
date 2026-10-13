/* Copy this folder to app/<slug>/ to start a topic. A folder starting with `_` is a private
   folder: Next never turns it into a route, so this file is not reachable at /_template. */

import { SheetView } from "../_components/SheetView";
import { sheet } from "./sheet";

export default function TopicSheetPage() {
  return <SheetView sheet={sheet} />;
}
