/* /server-client — the sheet itself. All the content lives in ./sheet.ts as data; the demo is /server-client/basics. */

import { SheetView } from "../_components/SheetView";
import { sheet } from "./sheet";

export default function ServerClientSheetPage() {
  return <SheetView sheet={sheet} />;
}
