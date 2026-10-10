"use client";

import React, { useState } from "react";
import {
  Database,
  PieChart as PieIcon,
  BarChart2,
  Table as TableIcon,
  Search,
  Filter,
  Info,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { researchData } from "@/lib/research-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DisclaimerBanner } from "@/components/ui/disclaimer-banner";

export default function DatasetExplorerPage() {
  const dataset = researchData.dataset;
  const [selectedFeature, setSelectedFeature] = useState<string>("mean radius");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<"all" | "mean" | "se" | "worst">("all");

  const classData = [
    { name: "Benign (0, Negative)", value: dataset.class_distribution.benign_count, color: "#0d9488" },
    { name: "Malignant (1, Positive)", value: dataset.class_distribution.malignant_count, color: "#e11d48" },
  ];

  // Filter features list for summary table
  const filteredFeatures = dataset.features.filter((f) => {
    const matchesSearch = f.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup =
      selectedGroup === "all" || dataset.feature_stats[f].group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const featStat = dataset.feature_stats[selectedFeature];

  // Comparison chart data for selected feature
  const featureComparisonData = featStat
    ? [
        {
          group: "Benign Cohort",
          Mean: featStat.benign.mean,
          Median: featStat.benign.median,
          Std: featStat.benign.std,
        },
        {
          group: "Overall Dataset",
          Mean: featStat.overall.mean,
          Median: featStat.overall.median,
          Std: featStat.overall.std,
        },
        {
          group: "Malignant Cohort",
          Mean: featStat.malignant.mean,
          Median: featStat.malignant.median,
          Std: featStat.malignant.std,
        },
      ]
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <DisclaimerBanner />

      {/* Dataset Overview Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Cohort Size
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {dataset.total_samples}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fine-needle aspirates (FNA) digitized cell nuclei
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Feature Dimensions
            </span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {dataset.n_features}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Continuous morphometric measurements
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Benign Cases (0)
            </span>
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">
              {dataset.class_distribution.benign_count}
            </div>
            <p className="text-xs text-emerald-800 mt-1">
              {dataset.class_distribution.benign_pct}% · Negative Class
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/20">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              Malignant Cases (1)
            </span>
            <div className="text-3xl font-extrabold text-rose-700 mt-1">
              {dataset.class_distribution.malignant_count}
            </div>
            <p className="text-xs text-rose-800 mt-1">
              {dataset.class_distribution.malignant_pct}% · Positive Class
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Label Mapping & Distribution Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cohort Class Distribution</CardTitle>
            <CardDescription>Binary diagnostic classification targets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {classData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <strong className="text-slate-800">Benign (Class 0):</strong>
                </span>
                <span className="text-slate-600 font-mono">357 (62.74%)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <strong className="text-slate-800">Malignant (Class 1):</strong>
                </span>
                <span className="text-slate-600 font-mono">212 (37.26%)</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 leading-normal">
                <strong>Standard Clinical Convention:</strong> Malignant is encoded as the Positive Class (1) so sensitivity directly measures cancer detection rate.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Feature Inspection & Benign vs Malignant Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between w-full flex-wrap gap-2">
              <div>
                <CardTitle>Interactive Feature Distribution Inspector</CardTitle>
                <CardDescription>
                  Comparing Benign vs Malignant nuclear morphometry
                </CardDescription>
              </div>
              <select
                value={selectedFeature}
                onChange={(e) => setSelectedFeature(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {dataset.features.map((f) => (
                  <option key={f} value={f}>
                    {f} ({dataset.feature_stats[f].category})
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {featStat && (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <span className="text-emerald-800 font-semibold block">Benign Median</span>
                    <span className="text-base font-bold text-emerald-950 font-mono">
                      {featStat.benign.median.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      Std: {featStat.benign.std.toFixed(3)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-600 font-semibold block">Cohort Median</span>
                    <span className="text-base font-bold text-slate-900 font-mono">
                      {featStat.overall.median.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Range: [{featStat.overall.min.toFixed(2)}, {featStat.overall.max.toFixed(2)}]
                    </span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                    <span className="text-rose-800 font-semibold block">Malignant Median</span>
                    <span className="text-base font-bold text-rose-950 font-mono">
                      {featStat.malignant.median.toFixed(3)}
                    </span>
                    <span className="text-[10px] text-rose-700 block mt-0.5">
                      Std: {featStat.malignant.std.toFixed(3)}
                    </span>
                  </div>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="group" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", border: "none", color: "#f8fafc", fontSize: "12px" }}
                        formatter={(val: any) => [typeof val === 'number' ? val.toFixed(3) : val, '']}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "5px" }} />
                      <Bar dataKey="Mean" fill="#0d9488" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Median" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Correlation Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Top Feature Correlations with Malignancy (Target r)</CardTitle>
          <CardDescription>
            Pearson correlation coefficient r against malignant diagnosis (y = 1)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(researchData.correlations.target_correlation)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .slice(0, 10)
              .map(([fname, r]) => (
                <div
                  key={fname}
                  className="p-3 rounded-lg border border-slate-200 bg-white hover:border-teal-400 transition-colors cursor-pointer"
                  onClick={() => setSelectedFeature(fname)}
                >
                  <div className="text-[11px] font-medium text-slate-700 truncate" title={fname}>
                    {fname}
                  </div>
                  <div className="text-base font-bold text-teal-700 font-mono mt-0.5">
                    r = +{r.toFixed(3)}
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full"
                      style={{ width: `${Math.abs(r) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Full 30-Feature Summary Statistics Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4 w-full">
            <div>
              <CardTitle>Complete Morphometric Feature Registry</CardTitle>
              <CardDescription>
                Summary statistics across all 30 WDBC continuous features
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                {(["all", "mean", "se", "worst"] as const).map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                      selectedGroup === grp
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {grp === "all" ? "All (30)" : grp}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/60">
                  <th className="py-3 px-4">Feature Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Cohort Mean ± Std</th>
                  <th className="py-3 px-4">Benign Median</th>
                  <th className="py-3 px-4">Malignant Median</th>
                  <th className="py-3 px-4">Target Correlation (r)</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFeatures.map((fname) => {
                  const stat = dataset.feature_stats[fname];
                  const r = researchData.correlations.target_correlation[fname] || 0;
                  return (
                    <tr
                      key={fname}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => setSelectedFeature(fname)}
                    >
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {fname}
                      </td>
                      <td className="py-2.5 px-4">
                        <Badge size="sm" variant="outline">{stat.category}</Badge>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {stat.overall.mean.toFixed(2)} ± {stat.overall.std.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-emerald-700">
                        {stat.benign.median.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-rose-700">
                        {stat.malignant.median.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-teal-700">
                        +{r.toFixed(3)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          className="text-[11px] font-medium text-teal-600 hover:text-teal-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFeature(fname);
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
