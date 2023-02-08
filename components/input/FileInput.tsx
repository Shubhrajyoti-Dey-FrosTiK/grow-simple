import { useEffect, useRef } from "react";
import {
  Group,
  Text,
  useMantineTheme,
  Dropzone,
  DropzoneProps,
  MIME_TYPES,
  Button,
  FileWithPath,
  Typography,
} from "../components";
import { IconUpload, IconX, IconCloudUpload } from "@tabler/icons";
import { useState } from "react";
import * as XLSX from "xlsx";

// Redux
import { useDispatch, useSelector } from "react-redux";
import {
  Drop,
  Pick,
  selectPickDrop,
  updateDropPoints,
  updatePickPoints,
} from "../../store/states/pickDrop";
import { DropCSV, PickCSV } from "../../types/pickDrop";

enum Options {
  "PICK" = "PICK",
  "DROP" = "DROP",
}

interface PickInterface {
  type: Options.PICK;
  data: Array<PickCSV>;
}

interface DropInterface {
  type: Options.DROP;
  data: Array<DropCSV>;
}

export default function FileInput({
  pick,
  drop,
}: {
  pick?: Boolean;
  drop?: Boolean;
}) {
  const theme = useMantineTheme();
  const dispatch = useDispatch();
  const ReduxPickDropContext = useSelector(selectPickDrop);

  const [data, setData] = useState<PickInterface | DropInterface>(
    pick ? { type: Options.PICK, data: [] } : { type: Options.DROP, data: [] }
  );

  const openRef = useRef<() => void>(null);

  const handleChange = (files: FileWithPath[]) => {
    const file = files[0];
    let reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function (e) {
      let data = new Uint8Array(e.target?.result as ArrayBufferLike);
      let workbook = XLSX.read(data, { type: "array" });
      // find the name of your sheet in the workbook first
      let worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // convert to json format
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (pick)
        setData({ type: Options.PICK, data: jsonData as Array<PickCSV> });
      else setData({ type: Options.DROP, data: jsonData as Array<DropCSV> });
    };
  };

  useEffect(() => {
    if (data.type === Options.PICK) {
      const pickData: Array<Pick> = [];
      data.data.forEach((pick: PickCSV) => {
        pickData.push({
          location: pick.address,
          numbers: pick.numbers,
          product_id: pick.product_id,
        });
      });
      dispatch(updatePickPoints({ pickPoints: pickData }));
    }
    if (data.type === Options.DROP) {
      const pickData: Array<Drop> = [];
      data.data.forEach((pick: DropCSV) => {
        pickData.push({
          location: pick.address,
          AWB: pick.AWB,
          product_id: pick.product_id,
        });
      });
      dispatch(updateDropPoints({ dropPoints: pickData }));
    }
  }, [data]);

  return (
    <div className="text-center max-w-lg relative">
      <Typography order={4} className="text-bold text-left">
        {pick ? "Select Drop Points" : "Select Pickup points"}
      </Typography>
      <Dropzone
        openRef={openRef}
        onDrop={(files) => handleChange(files)}
        maxSize={3 * 1024 ** 2}
        accept={[MIME_TYPES.xlsx]}
      >
        <Group
          position="center"
          spacing="xl"
          style={{ minHeight: 220, pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={50}
              stroke={1.5}
              color={
                theme.colors[theme.primaryColor][
                  theme.colorScheme === "dark" ? 4 : 6
                ]
              }
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              size={50}
              stroke={1.5}
              color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <div className="text-center">
              <IconCloudUpload
                size={100}
                className="m-auto"
                color={
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.black
                }
                stroke={1.5}
              />

              <Typography order={4} size="xl" inline>
                {pick ? "Select Pick points" : "Select Drop Points"} XLSX
              </Typography>
              <Text size="sm" color="dimmed" inline mt={7}>
                Drag and drop or click to attach {pick ? "Pickup" : "Drop"}
                Location XLSX files
              </Text>
            </div>
          </Dropzone.Idle>
        </Group>
      </Dropzone>

      <div className="relative z-2 bottom-[20px]">
        <Button onClick={() => openRef.current?.()} variant="gradient">
          Upload {pick ? "Pickup" : "Drop"} Points
        </Button>
      </div>
    </div>
  );
}
