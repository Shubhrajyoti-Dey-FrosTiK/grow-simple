"use client";
import { Box } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useEffect, useState } from "react";
import { Typography } from "./components";

const PAGE_SIZE = 5;

export default function DisplayCSV({ csv, pickup }) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(csv.slice(0, PAGE_SIZE));

  useEffect(() => {
    setRecords(csv.slice(0, PAGE_SIZE));
  }, [csv]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(csv.slice(from, to));
  }, [page]);

  return (
    <div>
      <Typography order={5}>{pickup ? "Pickups:" : "Drops:"}</Typography>
      <Box className="mt-2 mb-2" sx={{ height: 300 }}>
        <DataTable
          withBorder
          records={records}
          columns={
            pickup
              ? [
                  { accessor: "product_id", width: 100 },
                  { accessor: "location", width: "100%" },
                  { accessor: "numbers", width: 100 },
                ]
              : [
                  { accessor: "product_id", width: 120 },
                  { accessor: "location", width: "100%" },
                  { accessor: "AWB", width: 100 },
                ]
          }
          totalRecords={csv.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(p) => setPage(p)}
          // uncomment the next line to use a custom loading text
          // loadingText="Loading..."
          // uncomment the next line to display a custom text when no records were found
          // noRecordsText="No records found"
          // uncomment the next line to use a custom pagination text
          // paginationText={({ from, to, totalRecords }) => `Records ${from} - ${to} of ${totalRecords}`}
          // uncomment the next line to use a custom pagination color (see https://mantine.dev/theming/colors/)
          // paginationColor="grape"
          // uncomment the next line to use a custom pagination size
          // paginationSize="md"
        />
      </Box>
    </div>
  );
}
