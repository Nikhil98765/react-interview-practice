/* /routing — the sheet itself. All the content lives in ./sheet.ts as data. */

import { SheetView } from "../_components/SheetView";
import { sheet } from "./sheet";

export default function RoutingSheetPage() {
  return <SheetView sheet={sheet} />;
}
