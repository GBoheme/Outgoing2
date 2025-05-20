
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useDocuments } from "@/hooks/useDocuments";

const DocumentsChart = () => {
  const { documentsStats } = useDocuments();
  
  const data = [
    { name: "وثائق واردة", value: documentsStats?.inboundCount || 0 },
    { name: "وثائق صادرة", value: documentsStats?.outboundCount || 0 },
  ];
  
  const COLORS = ["#4ECDC4", "#FF6B6B"];
  
  return (
    <div className="h-[300px] w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value}`, "عدد الوثائق"]}
            contentStyle={{ backgroundColor: "#221F26", border: "1px solid #3A3A3C", textAlign: "right", direction: "rtl" }}
          />
          <Legend 
            formatter={(value) => <span style={{color: "white"}}>{value}</span>}
            layout="horizontal" 
            align="center"
            verticalAlign="bottom" 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DocumentsChart;
