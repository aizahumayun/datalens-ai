import { DatasetAnalysis, ColumnMeta } from '../types';

export interface CalculatedQueryResult {
  answerMarkdown: string;

  statHighlight?: {
    label: string;
    value: string;
    detail?: string;
  };

  suggestedChart?: {
    chartType: 'bar' | 'line' | 'pie';
    data: { name: string; value: number }[];
  };

  isMetricUnavailable?: boolean;
  unavailableMetricName?: string;
  availableMetrics?: string[];
}

/* =========================================================
   MAIN QUERY ENGINE
   ========================================================= */

export function answerDataQuery(
  dataset: DatasetAnalysis,
  userQuery: string
): CalculatedQueryResult {
 console.log('==============================');
  console.log('USER QUERY:', userQuery);
  console.log('NORMALIZED:', normalize(userQuery));
  console.log('COLUMNS:', dataset.columns);
  console.log('CATEGORY COLUMNS:', dataset.columns.filter(
    (c) =>
      (c.type === 'category' || c.type === 'boolean') &&
      !c.isIdentifier
  ));
  console.log('==============================');

  const query = normalize(userQuery);

  const {
    rawData,
    columns,
    totalRows,
    totalCols,
  } = dataset;

  const numericCols = columns.filter(
    (c) => c.type === 'number' && !c.isIdentifier
  );

  const categoryCols = columns.filter(
    (c) =>
      (c.type === 'category' || c.type === 'boolean') &&
      !c.isIdentifier
  );

  const dateCols = columns.filter(
    (c) => c.type === 'date' && !c.isIdentifier
  );

  const availableMetrics = numericCols.map((c) => c.name);

  /* =========================================================
     1. MISSING VALUES
     ========================================================= */

  if (
    containsAny(query, [
      'missing value',
      'missing values',
      'missing data',
      'null value',
      'null values',
      'empty value',
      'empty values',
      'blank value',
      'blank values',
    ])
  ) {
    return buildMissingValueResult(dataset);
  }

  /* =========================================================
     2. INVALID PHONE NUMBERS
     ========================================================= */

  if (
    containsAny(query, [
      'invalid phone',
      'invalid phone number',
      'invalid phone numbers',
      'potentially invalid phone',
      'phone validation',
      'phone number validation',
    ])
  ) {
    return buildPhoneValidationResult(dataset);
  }

  /* =========================================================
     3. ANOMALIES / OUTLIERS
     ========================================================= */

  if (
    containsAny(query, [
      'anomaly',
      'anomalies',
      'outlier',
      'outliers',
      'unusual value',
      'unusual values',
      'extreme value',
      'extreme values',
    ])
  ) {
    return buildAnomalyResult(dataset);
  }

  /* =========================================================
     4. DATASET OVERVIEW
     ========================================================= */

  if (
    query === 'summary' ||
    query === 'summarize' ||
    query === 'overview' ||
    containsAny(query, [
      'how many rows',
      'how many records',
      'total rows',
      'total records',
      'number of rows',
      'number of records',
    ])
  ) {
    return {
      answerMarkdown:
        `**Dataset Overview:**\n\n` +
        `This dataset contains **${formatNumber(totalRows)} records** ` +
        `across **${formatNumber(totalCols)} columns**.`,
      statHighlight: {
        label: 'Total Records',
        value: formatNumber(totalRows),
        detail: `${totalCols} columns`,
      },
    };
  }

  /* =========================================================
     5. FIND THE CATEGORY/COLUMN REFERRED TO IN THE QUESTION
     ========================================================= */

  

  const targetCategory = findTargetCategoryColumn(
    query,
    categoryCols,
    columns
  );


  const targetNumeric = findTargetNumericColumn(
    query,
    numericCols
  );

  const targetDate = findTargetDateColumn(
    query,
    dateCols
  );

  /* =========================================================
     6. CATEGORY COUNTING QUESTIONS

     Examples:
     - Which country has the highest number of customers?
     - Which city has the most customers?
     - How many customers are from Germany?
     - Show the number of customers by country
     ========================================================= */

  if (isCategoryCountQuestion(query)) {
    return handleCategoryCountQuestion(
      dataset,
      query,
      targetCategory,
      categoryCols
    );
  }

  /* =========================================================
     7. CATEGORY + NUMERIC AGGREGATION

     Examples:
     - Which department has the highest salary?
     - Which category has the lowest revenue?
     - Show revenue by country
     ========================================================= */

  if (
    targetNumeric &&
    targetCategory &&
    isGroupingQuestion(query)
  ) {
    return handleCategoryNumericQuestion(
      dataset,
      query,
      targetCategory,
      targetNumeric
    );
  }

  /* =========================================================
     8. DATE / TIME ANALYSIS

     Examples:
     - Which month had the highest revenue?
     - Show revenue trend over time
     ========================================================= */

  if (
    targetNumeric &&
    targetDate &&
    isDateQuestion(query)
  ) {
    return handleDateNumericQuestion(
      dataset,
      query,
      targetDate,
      targetNumeric
    );
  }

  /* =========================================================
     9. NUMERIC QUESTIONS

     Examples:
     - What is the average salary?
     - What is the total revenue?
     - What is the highest price?
     - What is the lowest score?
     ========================================================= */

  if (targetNumeric) {
    return handleNumericQuestion(
      dataset,
      query,
      targetNumeric
    );
  }

  /* =========================================================
     10. SPECIFIC CATEGORY VALUE COUNT

     Examples:
     - How many customers are from Germany?
     - How many people live in London?
     - How many users are from Canada?
     ========================================================= */

  if (targetCategory) {
    const categoryValue = extractCategoryValue(
      query,
      targetCategory,
      rawData
    );

    if (categoryValue) {
      return handleSpecificCategoryCount(
        dataset,
        targetCategory,
        categoryValue
      );
    }
  }

  /* =========================================================
     11. GENERAL CATEGORY DISTRIBUTION
     ========================================================= */

  if (
    targetCategory &&
    containsAny(query, [
      'distribution',
      'breakdown',
      'categories',
      'values',
      'show',
      'list',
    ])
  ) {
    return handleCategoryDistribution(
      dataset,
      targetCategory
    );
  }

  /* =========================================================
     12. NO MATCH
     ========================================================= */

  if (numericCols.length === 0) {
    return {
      answerMarkdown:
        `I couldn't identify a specific calculation in your question.\n\n` +
        `This dataset does not contain numerical metrics, but it does contain ` +
        `categorical fields such as **${categoryCols
          .slice(0, 8)
          .map((c) => c.name)
          .join(', ')}**.\n\n` +
        `You can ask questions such as:\n` +
        `• Which category has the most records?\n` +
        `• How many records have a specific value?\n` +
        `• Show the distribution by category.`,
      availableMetrics: [],
    };
  }

  return {
    answerMarkdown:
      `I couldn't determine exactly what you want to calculate.\n\n` +
      `Available numerical metrics: **${availableMetrics.join(', ')}**.`,
    availableMetrics,
  };
}

/* =========================================================
   CATEGORY COUNT QUESTIONS
   ========================================================= */

function isCategoryCountQuestion(query: string): boolean {
  return (
    containsAny(query, [
      'how many',
      'number of',
      'count of',
      'count',
      'most',
      'least',
      'highest number',
      'lowest number',
      'highest count',
      'lowest count',
      'most common',
      'least common',
      'number by',
      'count by',
      'show the number',
      'show number',
      'show count',
    ])
  );
}

function handleCategoryCountQuestion(
  dataset: DatasetAnalysis,
  query: string,
  targetCategory: ColumnMeta | undefined,
  categoryCols: ColumnMeta[]
): CalculatedQueryResult {

  /*
   * STEP 1:
   * Try to find an actual dataset value mentioned
   * in the user's question.
   *
   * Example:
   * "How many customers from Germany?"
   *
   * Germany -> Country
   */
   console.log('========== CATEGORY DEBUG ==========');
  console.log('QUERY:', query);
  console.log('TARGET CATEGORY:', targetCategory?.name);


  const valueMatch = findCategoryValueMatch(
    query,
    categoryCols,
    dataset.rawData
  );
  console.log(
  'VALUE MATCH:',
  valueMatch
    ? `${valueMatch.value} → ${valueMatch.column.name}`
    : 'none'
);
  /*
   * IMPORTANT:
   *
   * If a real dataset value was found, ALWAYS use
   * the column containing that value.
   *
   * Do not let targetCategory override it.
   */

  let column: ColumnMeta | undefined;
  let requestedValue: string | null = null;

  if (valueMatch) {
    column = valueMatch.column;
    requestedValue = valueMatch.value;
  } else {
    /*
     * No actual dataset value was found.
     * Now fall back to the explicitly mentioned category.
     */
    column =
      targetCategory ||
      inferCustomerDimension(
        query,
        categoryCols,
        dataset.rawData
      );
  }

console.log('FINAL COLUMN:', column?.name);
console.log('REQUESTED VALUE:', requestedValue);

  if (!column) {
    return {
      answerMarkdown:
        `I couldn't identify which categorical column you want to analyze.\n\n` +
        `Available categorical columns: **${categoryCols
          .map((c) => c.name)
          .join(', ')}**.`,
    };
  }

  /*
   * If a value wasn't found globally, try extracting it
   * specifically from the selected column.
   */
  if (!requestedValue) {
    requestedValue = extractCategoryValue(
      query,
      column,
      dataset.rawData
    );
  }

  /*
   * SPECIFIC VALUE QUESTION
   *
   * Example:
   * "How many customers are from Germany?"
   */
  if (
    requestedValue &&
    containsAny(query, [
      'how many',
      'number of',
      'count of',
      'count',
    ])
  ) {
    return handleSpecificCategoryCount(
      dataset,
      column,
      requestedValue
    );
  }

  /*
   * From here onward, this is a genuine
   * category distribution/ranking question.
   */

  const groups = countByCategory(
    dataset.rawData,
    column.name
  );

  if (groups.length === 0) {
    return {
      answerMarkdown:
        `No valid values were found in **${column.name}**.`,
    };
  }

  const sorted = [...groups].sort(
    (a, b) => b.count - a.count
  );

  const isLowest = containsAny(query, [
    'lowest',
    'least',
    'smallest',
    'minimum',
  ]);

  const isDistribution = containsAny(query, [
    'show',
    'distribution',
    'breakdown',
    'by',
    'number by',
    'count by',
  ]);

  /*
   * Highest category
   */
  if (!isDistribution && !isLowest) {
    const highest = sorted[0];

    return {
      answerMarkdown:
        `**${column.name} Distribution:**\n\n` +
        `The most represented **${column.name}** is ` +
        `**${highest.value}**, with **${formatNumber(
          highest.count
        )} ${recordWord(highest.count)}** ` +
        `(${percentage(
          highest.count,
          dataset.totalRows
        )} of all records).`,

      statHighlight: {
        label: `Highest ${column.name} Count`,
        value: highest.value,
        detail: `${formatNumber(
          highest.count
        )} records`,
      },

      suggestedChart: {
        chartType: 'bar',
        data: sorted.slice(0, 10).map((item) => ({
          name: item.value,
          value: item.count,
        })),
      },
    };
  }

  /*
   * Lowest category
   */
  if (isLowest) {
    const lowest =
      sorted[sorted.length - 1];

    return {
      answerMarkdown:
        `**${column.name} Distribution:**\n\n` +
        `The least represented **${column.name}** is ` +
        `**${lowest.value}**, with **${formatNumber(
          lowest.count
        )} ${recordWord(lowest.count)}** ` +
        `(${percentage(
          lowest.count,
          dataset.totalRows
        )} of all records).`,

      statHighlight: {
        label: `Lowest ${column.name} Count`,
        value: lowest.value,
        detail: `${formatNumber(
          lowest.count
        )} records`,
      },

      suggestedChart: {
        chartType: 'bar',
        data: sorted
          .slice(-10)
          .reverse()
          .map((item) => ({
            name: item.value,
            value: item.count,
          })),
      },
    };
  }

  /*
   * Distribution
   */
  const top = sorted.slice(0, 15);

  const list = top
    .map(
      (item) =>
        `• **${item.value}** — **${formatNumber(
          item.count
        )} ${recordWord(item.count)} (${percentage(
          item.count,
          dataset.totalRows
        )})`
    )
    .join('\n');

  return {
    answerMarkdown:
      `**${column.name} Distribution:**\n\n` +
      `There are **${formatNumber(
        groups.length
      )} unique ${column.name.toLowerCase()} values** across ` +
      `**${formatNumber(
        dataset.totalRows
      )} records**.\n\n` +
      `${list}\n\n` +
      `Showing the top ${top.length} categories.`,

    statHighlight: {
      label: `Unique ${column.name}`,
      value: formatNumber(groups.length),
      detail: `${formatNumber(
        dataset.totalRows
      )} total records`,
    },

    suggestedChart: {
      chartType: 'bar',
      data: top.map((item) => ({
        name: item.value,
        value: item.count,
      })),
    },
  };
}
/* =========================================================
   SPECIFIC CATEGORY COUNT
   ========================================================= */

function handleSpecificCategoryCount(
  dataset: DatasetAnalysis,
  column: ColumnMeta,
  value: string
): CalculatedQueryResult {
  const normalizedTarget = value.trim().toLowerCase();

  const count = dataset.rawData.filter((row) => {
    const actual = String(
      row[column.name] ?? ''
    )
      .trim()
      .toLowerCase();

    return actual === normalizedTarget;
  }).length;

  return {
    answerMarkdown:
      `**${column.name} Count:**\n\n` +
      `There are **${formatNumber(
        count
      )} ${recordWord(count)}** where **${column.name}** is ` +
      `**${value}**.\n\n` +
      `This represents **${percentage(
        count,
        dataset.totalRows
      )}** of all ${formatNumber(dataset.totalRows)} records.`,
    statHighlight: {
      label: column.name,
      value: value,
      detail: `${formatNumber(count)} ${recordWord(count)}`,
    },
  };
}

/* =========================================================
   CATEGORY + NUMERIC
   ========================================================= */

function handleCategoryNumericQuestion(
  dataset: DatasetAnalysis,
  query: string,
  category: ColumnMeta,
  numeric: ColumnMeta
): CalculatedQueryResult {
  const map: Record<
    string,
    {
      sum: number;
      count: number;
    }
  > = {};

  dataset.rawData.forEach((row) => {
    const categoryValue = String(
      row[category.name] ?? 'Unknown'
    ).trim();

    const value = Number(row[numeric.name]);

    if (Number.isNaN(value)) return;

    if (!map[categoryValue]) {
      map[categoryValue] = {
        sum: 0,
        count: 0,
      };
    }

    map[categoryValue].sum += value;
    map[categoryValue].count += 1;
  });

  const groups = Object.entries(map).map(
    ([name, stats]) => ({
      name,
      sum: stats.sum,
      average:
        stats.count > 0
          ? stats.sum / stats.count
          : 0,
      count: stats.count,
    })
  );

  const lowest = containsAny(query, [
    'lowest',
    'least',
    'minimum',
    'smallest',
  ]);

  groups.sort((a, b) =>
    lowest
      ? a.average - b.average
      : b.average - a.average
  );

  const winner = groups[0];

  const ranking = groups
    .slice(0, 10)
    .map(
      (item) =>
        `• **${item.name}** — Average ${numeric.name}: **${formatMetricValue(
          item.average,
          numeric.name
        )}** (${formatNumber(item.count)} records)`
    )
    .join('\n');

  return {
    answerMarkdown:
      `**${numeric.name} by ${category.name}:**\n\n` +
      `The ${lowest ? 'lowest' : 'highest'} performing ` +
      `**${category.name}** is **${winner.name}**, with an ` +
      `average **${numeric.name}** of **${formatMetricValue(
        winner.average,
        numeric.name
      )}**.\n\n` +
      `**Category Rankings:**\n${ranking}`,
    statHighlight: {
      label: `${lowest ? 'Lowest' : 'Highest'} ${category.name}`,
      value: winner.name,
      detail: `Avg ${numeric.name}: ${formatMetricValue(
        winner.average,
        numeric.name
      )}`,
    },
    suggestedChart: {
      chartType: 'bar',
      data: groups.slice(0, 10).map((item) => ({
        name: item.name,
        value: Number(item.average.toFixed(2)),
      })),
    },
  };
}

/* =========================================================
   NUMERIC QUESTIONS
   ========================================================= */

function handleNumericQuestion(
  dataset: DatasetAnalysis,
  query: string,
  column: ColumnMeta
): CalculatedQueryResult {
  const values = dataset.rawData
    .map((row) => Number(row[column.name]))
    .filter((value) => !Number.isNaN(value));

  if (values.length === 0) {
    return {
      answerMarkdown:
        `There are no valid numerical values in **${column.name}**.`,
      isMetricUnavailable: true,
      unavailableMetricName: column.name,
    };
  }

  const sum = values.reduce(
    (a, b) => a + b,
    0
  );

  const average = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (
    containsAny(query, [
      'average',
      'mean',
      'avg',
    ])
  ) {
    return {
      answerMarkdown:
        `**Average ${column.name}:**\n\n` +
        `The average **${column.name}** is ` +
        `**${formatMetricValue(
          average,
          column.name
        )}** across ${formatNumber(
          values.length
        )} valid records.\n\n` +
        `Range: **${formatMetricValue(
          min,
          column.name
        )}** to **${formatMetricValue(
          max,
          column.name
        )}**.`,
      statHighlight: {
        label: `Average ${column.name}`,
        value: formatMetricValue(
          average,
          column.name
        ),
        detail: `${formatNumber(values.length)} valid records`,
      },
    };
  }

  if (
    containsAny(query, [
      'total',
      'sum',
      'overall',
    ])
  ) {
    return {
      answerMarkdown:
        `**Total ${column.name}:**\n\n` +
        `The total **${column.name}** is ` +
        `**${formatMetricValue(
          sum,
          column.name
        )}** across ${formatNumber(
          values.length
        )} valid records.`,
      statHighlight: {
        label: `Total ${column.name}`,
        value: formatMetricValue(
          sum,
          column.name
        ),
        detail: `Average: ${formatMetricValue(
          average,
          column.name
        )}`,
      },
    };
  }

  if (
    containsAny(query, [
      'highest',
      'maximum',
      'max',
      'peak',
      'largest',
    ])
  ) {
    return {
      answerMarkdown:
        `**Highest ${column.name}:**\n\n` +
        `The highest recorded **${column.name}** is ` +
        `**${formatMetricValue(
          max,
          column.name
        )}**.`,
      statHighlight: {
        label: `Maximum ${column.name}`,
        value: formatMetricValue(
          max,
          column.name
        ),
      },
    };
  }

  if (
    containsAny(query, [
      'lowest',
      'minimum',
      'min',
      'smallest',
    ])
  ) {
    return {
      answerMarkdown:
        `**Lowest ${column.name}:**\n\n` +
        `The lowest recorded **${column.name}** is ` +
        `**${formatMetricValue(
          min,
          column.name
        )}**.`,
      statHighlight: {
        label: `Minimum ${column.name}`,
        value: formatMetricValue(
          min,
          column.name
        ),
      },
    };
  }

  return {
    answerMarkdown:
      `**${column.name} Summary:**\n\n` +
      `• **Total:** ${formatMetricValue(
        sum,
        column.name
      )}\n` +
      `• **Average:** ${formatMetricValue(
        average,
        column.name
      )}\n` +
      `• **Minimum:** ${formatMetricValue(
        min,
        column.name
      )}\n` +
      `• **Maximum:** ${formatMetricValue(
        max,
        column.name
      )}\n` +
      `• **Valid Records:** ${formatNumber(
        values.length
      )}`,
  };
}

/* =========================================================
   DATE + NUMERIC
   ========================================================= */

function handleDateNumericQuestion(
  dataset: DatasetAnalysis,
  query: string,
  dateColumn: ColumnMeta,
  numericColumn: ColumnMeta
): CalculatedQueryResult {
  const map: Record<string, number> = {};

  dataset.rawData.forEach((row) => {
    const rawDate = row[dateColumn.name];

    if (!rawDate) return;

    const date = new Date(String(rawDate));

    if (Number.isNaN(date.getTime())) return;

    const key =
      `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

    const value = Number(
      row[numericColumn.name]
    );

    if (Number.isNaN(value)) return;

    map[key] = (map[key] || 0) + value;
  });

  const entries = Object.entries(map);

  if (entries.length === 0) {
    return {
      answerMarkdown:
        `No valid date-based data could be calculated using ` +
        `**${dateColumn.name}**.`,
    };
  }

  entries.sort((a, b) => b[1] - a[1]);

  const highest = entries[0];
  const lowest =
    entries[entries.length - 1];

  return {
    answerMarkdown:
      `**${numericColumn.name} Trend by Month:**\n\n` +
      `• **Highest Period:** **${highest[0]}** with ` +
      `**${formatMetricValue(
        highest[1],
        numericColumn.name
      )}**\n` +
      `• **Lowest Period:** **${lowest[0]}** with ` +
      `**${formatMetricValue(
        lowest[1],
        numericColumn.name
      )}**`,
    statHighlight: {
      label: `Peak Month`,
      value: highest[0],
      detail: formatMetricValue(
        highest[1],
        numericColumn.name
      ),
    },
    suggestedChart: {
      chartType: 'line',
      data: entries.map(
        ([name, value]) => ({
          name,
          value: Number(value.toFixed(2)),
        })
      ),
    },
  };
}

/* =========================================================
   MISSING VALUES
   ========================================================= */

function buildMissingValueResult(
  dataset: DatasetAnalysis
): CalculatedQueryResult {
  const columnsWithMissing = dataset.columns
    .filter((column) => column.missingCount > 0)
    .map((column) => ({
      name: column.name,
      count: column.missingCount,
    }));

  if (columnsWithMissing.length === 0) {
    return {
      answerMarkdown:
        `**Missing Value Analysis:**\n\n` +
        `No missing values were detected in **${dataset.fileName}**. ` +
        `All **${formatNumber(
          dataset.totalRows
        )} records** have values across all **${formatNumber(
          dataset.totalCols
        )} columns**.`,
      statHighlight: {
        label: 'Missing Values',
        value: '0',
        detail: 'Dataset is complete',
      },
    };
  }

  const totalMissing =
    columnsWithMissing.reduce(
      (sum, column) => sum + column.count,
      0
    );

  const list = columnsWithMissing
    .map(
      (column) =>
        `• **${column.name}** — ${formatNumber(
          column.count
        )} missing value(s)`
    )
    .join('\n');

  return {
    answerMarkdown:
      `**Missing Value Analysis:**\n\n` +
      `Found **${formatNumber(
        totalMissing
      )} missing values** across **${formatNumber(
        columnsWithMissing.length
      )} columns**.\n\n${list}`,
    statHighlight: {
      label: 'Missing Values',
      value: formatNumber(totalMissing),
      detail: `${columnsWithMissing.length} affected columns`,
    },
  };
}

/* =========================================================
   PHONE VALIDATION
   ========================================================= */

function buildPhoneValidationResult(
  dataset: DatasetAnalysis
): CalculatedQueryResult {
  const phoneColumns = dataset.columns.filter(
    (column) =>
      /phone|mobile|telephone|tel/i.test(
        column.name
      )
  );

  if (phoneColumns.length === 0) {
    return {
      answerMarkdown:
        `No phone-number column was detected in this dataset.`,
    };
  }

  const invalid: {
    row: number;
    column: string;
    value: string;
  }[] = [];

  phoneColumns.forEach((column) => {
    dataset.rawData.forEach((row, index) => {
      const value = String(
        row[column.name] ?? ''
      ).trim();

      if (!value) return;

      if (!isPotentiallyValidPhone(value)) {
        invalid.push({
          row: index + 2,
          column: column.name,
          value,
        });
      }
    });
  });

  if (invalid.length === 0) {
    return {
      answerMarkdown:
        `**Phone Number Validation:**\n\n` +
        `No potentially invalid phone numbers were detected.`,
      statHighlight: {
        label: 'Invalid Phones',
        value: '0',
        detail: 'All detected phone numbers passed basic validation',
      },
    };
  }

  const examples = invalid
    .slice(0, 10)
    .map(
      (item) =>
        `• **Row ${item.row} — ${item.column}:** ${item.value}`
    )
    .join('\n');

  return {
    answerMarkdown:
      `**Phone Number Validation:**\n\n` +
      `Found **${formatNumber(
        invalid.length
      )} potentially invalid phone number(s)**.\n\n` +
      `${examples}\n\n` +
      `Showing the first ${Math.min(
        10,
        invalid.length
      )} results.`,
    statHighlight: {
      label: 'Potentially Invalid Phones',
      value: formatNumber(invalid.length),
    },
  };
}

function isPotentiallyValidPhone(
  value: string
): boolean {
  /*
   * Extensions such as x1234 are valid in many datasets.
   * Remove extension before checking the base number.
   */
  const withoutExtension = value
    .replace(
      /\s*(ext\.?|x|extension)\s*\d+.*$/i,
      ''
    )
    .trim();

  const digits = withoutExtension.replace(
    /\D/g,
    ''
  );

  /*
   * General international phone validation.
   * We deliberately do not validate a country-specific
   * numbering plan because datasets can contain global numbers.
   */
  return (
    digits.length >= 7 &&
    digits.length <= 15
  );
}

/* =========================================================
   ANOMALIES
   ========================================================= */

function buildAnomalyResult(
  dataset: DatasetAnalysis
): CalculatedQueryResult {
  if (!dataset.anomalies || dataset.anomalies.length === 0) {
    return {
      answerMarkdown:
        `**Anomaly Analysis:**\n\n` +
        `No statistical anomalies or extreme outliers were detected.`,
      statHighlight: {
        label: 'Detected Anomalies',
        value: '0',
        detail: 'No anomalies detected',
      },
    };
  }

  const list = dataset.anomalies
    .slice(0, 10)
    .map(
      (item) =>
        `• **Row #${item.rowIndex} (${item.metricName})** — ` +
        `Value: **${item.value}**; expected range: **${item.expectedRange}**`
    )
    .join('\n');

  return {
    answerMarkdown:
      `**Anomalies & Outliers:**\n\n` +
      `Found **${dataset.anomalies.length} potential anomaly/anomalies**.\n\n` +
      list,
    statHighlight: {
      label: 'Detected Anomalies',
      value: String(
        dataset.anomalies.length
      ),
    },
  };
}

/* =========================================================
   CATEGORY DISTRIBUTION
   ========================================================= */

function handleCategoryDistribution(
  dataset: DatasetAnalysis,
  column: ColumnMeta
): CalculatedQueryResult {
  const groups = countByCategory(
    dataset.rawData,
    column.name
  );

  const sorted = groups.sort(
    (a, b) => b.count - a.count
  );

  const top = sorted.slice(0, 15);

  const list = top
    .map(
      (item) =>
        `• **${item.value}** — **${formatNumber(
          item.count
        )} ${recordWord(item.count)} (${percentage(
          item.count,
          dataset.totalRows
        )})`
    )
    .join('\n');

  return {
    answerMarkdown:
      `**${column.name} Distribution:**\n\n` +
      `There are **${formatNumber(
        groups.length
      )} unique ${column.name.toLowerCase()} values** across ` +
      `**${formatNumber(
        dataset.totalRows
      )} records**.\n\n` +
      `${list}\n\n` +
      `Showing the top ${top.length} categories.`,
    statHighlight: {
      label: `Unique ${column.name}`,
      value: formatNumber(groups.length),
      detail: `${formatNumber(dataset.totalRows)} total records`,
    },
    suggestedChart: {
      chartType: 'bar',
      data: top.map((item) => ({
        name: item.value,
        value: item.count,
      })),
    },
  };
}

/* =========================================================
   COLUMN MATCHING
   ========================================================= */

function findTargetCategoryColumn(
  query: string,
  categoryCols: ColumnMeta[],
  allColumns: ColumnMeta[]
): ColumnMeta | undefined {
  /*
   * Exact column name first.
   */
  for (const column of allColumns) {
    if (
      query.includes(
        normalize(column.name)
      )
    ) {
      if (
        column.type === 'category' ||
        column.type === 'boolean'
      ) {
        return column;
      }
    }
  }

  /*
   * Semantic category aliases.
   */
  const aliases: Record<string, string[]> = {
    country: [
      'country',
      'countries',
      'nation',
      'nationality',
    ],

    city: [
      'city',
      'cities',
      'town',
      'location',
    ],

    gender: [
      'gender',
      'sex',
    ],

    state: [
      'state',
      'province',
      'region',
    ],

    category: [
      'category',
      'categories',
      'type',
      'segment',
    ],

    department: [
      'department',
      'dept',
      'division',
      'team',
    ],

    status: [
      'status',
      'state',
    ],

    name: [
      'name',
      'first name',
      'last name',
    ],
  };

  for (const column of categoryCols) {
    const columnName = normalize(
      column.name
    );

    for (const terms of Object.values(
      aliases
    )) {
      const queryHasAlias = terms.some((term) =>
        query.includes(normalize(term))
      );

      const columnHasAlias = terms.some((term) =>
        columnName.includes(normalize(term))
      );

      if (queryHasAlias && columnHasAlias) {
        return column;
      }
    }
  }

  return undefined;
}

function findTargetNumericColumn(
  query: string,
  numericCols: ColumnMeta[]
): ColumnMeta | undefined {
  /*
   * Exact column name.
   */
  for (const column of numericCols) {
    const name = normalize(column.name);

    if (
      query.includes(name) ||
      name.includes(query)
    ) {
      return column;
    }
  }

  /*
   * Semantic numeric aliases.
   */
  const aliases: Record<string, string[]> = {
    revenue: [
      'revenue',
      'sales',
      'income',
      'earnings',
    ],

    profit: [
      'profit',
      'net profit',
      'gross profit',
    ],

    salary: [
      'salary',
      'wage',
      'pay',
      'compensation',
    ],

    price: [
      'price',
      'amount',
      'value',
    ],

    quantity: [
      'quantity',
      'units',
      'units sold',
    ],

    orders: [
      'orders',
      'order count',
    ],

    score: [
      'score',
      'rating',
      'performance',
    ],

    cost: [
      'cost',
      'expense',
      'spend',
    ],

    discount: [
      'discount',
    ],
  };

  for (const column of numericCols) {
    const name = normalize(
      column.name
    );

    for (const terms of Object.values(
      aliases
    )) {
      const queryHasTerm = terms.some((term) =>
        query.includes(normalize(term))
      );

      const columnHasTerm = terms.some((term) =>
        name.includes(normalize(term))
      );

      if (queryHasTerm && columnHasTerm) {
        return column;
      }
    }
  }

  return undefined;
}

function findTargetDateColumn(
  query: string,
  dateCols: ColumnMeta[]
): ColumnMeta | undefined {
  if (dateCols.length === 0) {
    return undefined;
  }

  for (const column of dateCols) {
    if (
      query.includes(
        normalize(column.name)
      )
    ) {
      return column;
    }
  }

  return dateCols[0];
}
function findCategoryValueMatch(
  query: string,
  categoryCols: ColumnMeta[],
  rows: DatasetAnalysis['rawData']
): {
  column: ColumnMeta;
  value: string;
} | null {

  const normalizedQuery = normalize(query);

  console.log('========== VALUE MATCH DEBUG ==========');
  console.log('QUERY:', normalizedQuery);

  for (const column of categoryCols) {
    const uniqueValues = Array.from(
      new Set(
        rows
          .map((row) =>
            String(row[column.name] ?? '').trim()
          )
          .filter(Boolean)
      )
    );

    console.log(
      `COLUMN "${column.name}" SAMPLE VALUES:`,
      uniqueValues.slice(0, 20)
    );

    for (const value of uniqueValues) {
      const normalizedValue = normalize(value);

      if (!normalizedValue) continue;

      const escapedValue = normalizedValue.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const valueRegex = new RegExp(
        `\\b${escapedValue}\\b`,
        'i'
      );

      if (valueRegex.test(normalizedQuery)) {
        console.log(
          'MATCH FOUND:',
          value,
          '→',
          column.name
        );

        return {
          column,
          value,
        };
      }
    }
  }

  console.log('NO VALUE MATCH FOUND');
  console.log('======================================');

  return null;
}

/* =========================================================
   CATEGORY VALUE EXTRACTION
   ========================================================= */

function extractCategoryValue(
  query: string,
  column: ColumnMeta,
  rows: DatasetAnalysis['rawData']
): string | null {
  const uniqueValues = Array.from(
    new Set(
      rows
        .map((row) =>
          String(row[column.name] ?? '').trim()
        )
        .filter(Boolean)
    )
  );

  const normalizedQuery = normalize(query);

  /*
   * Longest values first.
   * This prevents "York" from matching before "New York".
   */
  const sortedValues = [...uniqueValues].sort(
    (a, b) =>
      normalize(b).length -
      normalize(a).length
  );

  for (const value of sortedValues) {
    const normalizedValue = normalize(value);

    if (!normalizedValue) continue;

    const escapedValue = normalizedValue
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const regex = new RegExp(
      `\\b${escapedValue}\\b`,
      'i'
    );

    if (regex.test(normalizedQuery)) {
      return value;
    }
  }

  return null;
}
/* =========================================================
   FIND CATEGORY COLUMN BY ACTUAL DATASET VALUE
   ========================================================= */

/**
 * Determines which categorical column contains the value
 * mentioned in the user's question.
 *
 * Example:
 *
 * "How many customers are from Germany?"
 *
 * The question does not explicitly say "Country".
 * This function searches the actual dataset and finds:
 *
 * Country -> Germany
 *
 * Therefore the engine counts Country = Germany instead
 * of accidentally using the first categorical column.
 *
 * This is dataset-independent and works for any categorical
 * value that actually exists in the uploaded dataset.
 */
function findCategoryColumnByValue(
  query: string,
  categoryCols: ColumnMeta[],
  rows: DatasetAnalysis['rawData']
): ColumnMeta | undefined {
  const normalizedQuery = normalize(query);

  const candidates: {
    column: ColumnMeta;
    value: string;
    normalizedValue: string;
  }[] = [];

  for (const column of categoryCols) {
    const uniqueValues = Array.from(
      new Set(
        rows
          .map((row) =>
            String(row[column.name] ?? '').trim()
          )
          .filter(Boolean)
      )
    );

    for (const value of uniqueValues) {
      const normalizedValue = normalize(value);

      if (!normalizedValue) continue;

      candidates.push({
        column,
        value,
        normalizedValue,
      });
    }
  }

  /*
   * Longest values first.
   * Example:
   * "New York" should be checked before "York".
   */
  candidates.sort(
    (a, b) =>
      b.normalizedValue.length -
      a.normalizedValue.length
  );

  /*
   * Match the actual dataset value against the query.
   */
  for (const candidate of candidates) {
    const escapedValue = candidate.normalizedValue
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const valueRegex = new RegExp(
      `\\b${escapedValue}\\b`,
      'i'
    );

    if (valueRegex.test(normalizedQuery)) {
      return candidate.column;
    }
  }

  return undefined;
}

/* =========================================================
   CUSTOMER-LIKE DIMENSION INFERENCE
   ========================================================= */

function inferCustomerDimension(
  query: string,
  categoryCols: ColumnMeta[],
  rows: DatasetAnalysis['rawData']
): ColumnMeta | undefined {
  /*
   * 1. Explicit semantic hints
   */

  if (
    containsAny(query, [
      'country',
      'countries',
      'nation',
      'nationality',
    ])
  ) {
    const countryColumn = categoryCols.find((c) =>
      /country|nation|nationality/i.test(c.name)
    );

    if (countryColumn) {
      return countryColumn;
    }
  }

  if (
    containsAny(query, [
      'city',
      'cities',
      'town',
      'live in',
      'lives in',
      'living in',
    ])
  ) {
    const cityColumn = categoryCols.find((c) =>
      /city|town/i.test(c.name)
    );

    if (cityColumn) {
      return cityColumn;
    }
  }

  /*
   * 2. Match ACTUAL dataset values using word boundaries.
   *
   * Never use:
   * query.includes(normalizedValue)
   *
   * because values such as "Tom" can accidentally match
   * inside words such as "customers".
   */

  let bestColumn: ColumnMeta | undefined;
  let bestMatchScore = 0;

  for (const column of categoryCols) {
    const uniqueValues = Array.from(
      new Set(
        rows
          .map((row) =>
            String(row[column.name] ?? '').trim()
          )
          .filter(Boolean)
      )
    );

    for (const value of uniqueValues) {
      const normalizedValue = normalize(value);

      if (!normalizedValue) continue;

      const escapedValue = normalizedValue.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const regex = new RegExp(
        `\\b${escapedValue}\\b`,
        'i'
      );

      if (regex.test(query)) {
        const score = normalizedValue.length;

        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestColumn = column;
        }
      }
    }
  }

  return bestColumn;
}

/* =========================================================
   COUNTING
   ========================================================= */

function countByCategory(
  rows: DatasetAnalysis['rawData'],
  columnName: string
): {
  value: string;
  count: number;
}[] {
  const map: Record<string, number> = {};

  rows.forEach((row) => {
    const value = String(
      row[columnName] ?? ''
    ).trim();

    if (!value) return;

    map[value] =
      (map[value] || 0) + 1;
  });

  return Object.entries(map).map(
    ([value, count]) => ({
      value,
      count,
    })
  );
}

/* =========================================================
   QUESTION CLASSIFICATION
   ========================================================= */

function isGroupingQuestion(
  query: string
): boolean {
  return containsAny(query, [
    'by',
    'per',
    'group',
    'category',
    'department',
    'country',
    'city',
    'region',
    'highest',
    'lowest',
    'most',
    'least',
  ]);
}

function isDateQuestion(
  query: string
): boolean {
  return containsAny(query, [
    'month',
    'monthly',
    'date',
    'daily',
    'year',
    'yearly',
    'trend',
    'over time',
  ]);
}

/* =========================================================
   HELPERS
   ========================================================= */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsAny(
  text: string,
  terms: string[]
): boolean {
  return terms.some((term) =>
    text.includes(normalize(term))
  );
}

function formatNumber(
  value: number
): string {
  return value.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  );
}

function percentage(
  count: number,
  total: number
): string {
  if (total === 0) return '0%';

  return `${(
    (count / total) *
    100
  ).toFixed(1)}%`;
}

function recordWord(
  count: number
): string {
  return count === 1
    ? 'record'
    : 'records';
}

function formatMetricValue(
  value: number,
  columnName: string
): string {
  const name = columnName.toLowerCase();

  const currency =
    name.includes('revenue') ||
    name.includes('sales') ||
    name.includes('profit') ||
    name.includes('salary') ||
    name.includes('cost') ||
    name.includes('price') ||
    name.includes('income') ||
    name.includes('spend');

  const percent =
    name.includes('rate') ||
    name.includes('percentage') ||
    name.includes('percent') ||
    name.includes('pct');

  if (currency) {
    return `$${value.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  if (percent) {
    return `${value.toFixed(2)}%`;
  }

  return value.toLocaleString(
    undefined,
    {
      maximumFractionDigits: 2,
    }
  );
}