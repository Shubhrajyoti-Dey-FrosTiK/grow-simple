"use client";

// Converting Mantine to Client Components
import {
  TextInput,
  Title as Typography,
  Input,
  Textarea,
  NumberInput,
  Group,
  Text,
  useMantineTheme,
  createStyles,
} from "@mantine/core";

import {
  Dropzone,
  DropzoneProps,
  IMAGE_MIME_TYPE,
  MIME_TYPES,
  FileWithPath,
} from "@mantine/dropzone";

// Switching to Material Tailwind if Mantine is not good
import { Button } from "@material-tailwind/react";

export {
  TextInput,
  Typography,
  MIME_TYPES,
  Button,
  Input,
  createStyles,
  Textarea,
  NumberInput,
  Group,
  Text,
  useMantineTheme,
  Dropzone,
  IMAGE_MIME_TYPE,
};

export type { DropzoneProps, FileWithPath };
