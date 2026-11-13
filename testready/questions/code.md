# group: Strings
? Reverse each word in a sentence | E
```java
public static String reverseWords(String s) {
    StringBuilder out = new StringBuilder();
    for (String w : s.split(" ")) {
        if (out.length() > 0) out.append(' ');
        out.append(new StringBuilder(w).reverse());
    }
    return out.toString();
}
```
```python
def reverse_words(s: str) -> str:
    return " ".join(w[::-1] for w in s.split(" "))
```
> "Selenium is fun" → "muineleS si nuf". Clarify whether punctuation stays in place.

? Reverse the order of words | E
```java
public static String reverseOrder(String s) {
    String[] w = s.trim().split("\\s+");
    Collections.reverse(Arrays.asList(w));
    return String.join(" ", w);
}
```
```python
def reverse_order(s: str) -> str:
    return " ".join(reversed(s.split()))
```
> Splitting on `\s+` also collapses multiple spaces.

? Count vowels and consonants | E
```java
public static int[] vowelsConsonants(String s) {
    int v = 0, c = 0;
    for (char ch : s.toLowerCase().toCharArray()) {
        if (!Character.isLetter(ch)) continue;
        if ("aeiou".indexOf(ch) >= 0) v++; else c++;
    }
    return new int[]{v, c};
}
```
```python
def vowels_consonants(s: str):
    letters = [c for c in s.lower() if c.isalpha()]
    v = sum(c in "aeiou" for c in letters)
    return v, len(letters) - v
```
> Ignore digits, spaces and punctuation.

? Count words in a string | E
```java
public static int countWords(String s) {
    String t = s.trim();
    return t.isEmpty() ? 0 : t.split("\\s+").length;
}
```
```python
def count_words(s: str) -> int:
    return len(s.split())
```
> Handle empty strings and multiple spaces; interviewers often test those.

? Word frequency in a paragraph | M
```java
public static Map<String, Integer> wordFreq(String text) {
    Map<String, Integer> m = new LinkedHashMap<>();
    for (String w : text.toLowerCase().split("\\W+"))
        if (!w.isEmpty()) m.merge(w, 1, Integer::sum);
    return m;
}
```
```python
import re
from collections import Counter

def word_freq(text: str) -> dict:
    return dict(Counter(re.findall(r"\w+", text.lower())))
```
> Normalise case and strip punctuation before counting.

? Remove duplicate characters, keep first occurrence | E
```java
public static String dedupe(String s) {
    StringBuilder sb = new StringBuilder();
    Set<Character> seen = new HashSet<>();
    for (char c : s.toCharArray()) if (seen.add(c)) sb.append(c);
    return sb.toString();
}
```
```python
def dedupe(s: str) -> str:
    return "".join(dict.fromkeys(s))
```
> `dict.fromkeys` keeps insertion order in Python 3.7+.

? Check if two strings are rotations of each other | M
```java
public static boolean isRotation(String a, String b) {
    return a.length() == b.length() && (a + a).contains(b);
}
```
```python
def is_rotation(a: str, b: str) -> bool:
    return len(a) == len(b) and b in a + a
```
> "waterbottle" is a rotation of "erbottlewat". The doubling trick is the expected answer.

? Longest substring without repeating characters | H
```java
public static int longestUnique(String s) {
    Map<Character, Integer> last = new HashMap<>();
    int best = 0, start = 0;
    for (int i = 0; i < s.length(); i++) {
        Integer prev = last.put(s.charAt(i), i);
        if (prev != null && prev >= start) start = prev + 1;
        best = Math.max(best, i - start + 1);
    }
    return best;
}
```
```python
def longest_unique(s: str) -> int:
    last, start, best = {}, 0, 0
    for i, c in enumerate(s):
        if c in last and last[c] >= start:
            start = last[c] + 1
        last[c] = i
        best = max(best, i - start + 1)
    return best
```
> Sliding window, O(n). "abcabcbb" → 3.

? Longest palindromic substring | H
```java
public static String longestPalindrome(String s) {
    int bs = 0, bl = 0;
    for (int c = 0; c < s.length(); c++) {
        for (int odd = 0; odd < 2; odd++) {
            int l = c, r = c + odd;
            while (l >= 0 && r < s.length() && s.charAt(l) == s.charAt(r)) { l--; r++; }
            if (r - l - 1 > bl) { bl = r - l - 1; bs = l + 1; }
        }
    }
    return s.substring(bs, bs + bl);
}
```
```python
def longest_palindrome(s: str) -> str:
    best = ""
    for c in range(len(s)):
        for l, r in ((c, c), (c, c + 1)):
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1; r += 1
            if r - l - 1 > len(best):
                best = s[l + 1:r]
    return best
```
> Expand around each centre (odd and even lengths). O(n²) time, O(1) space.

? Check if a string contains only digits | E
```java
public static boolean onlyDigits(String s) {
    return !s.isEmpty() && s.chars().allMatch(Character::isDigit);
}
```
```python
def only_digits(s: str) -> bool:
    return s.isdigit()
```
> Mention `s.matches("\\d+")` as the regex alternative.

? Swap two strings without a third variable | E
```java
public static String[] swap(String a, String b) {
    a = a + b;
    b = a.substring(0, a.length() - b.length());
    a = a.substring(b.length());
    return new String[]{a, b};
}
```
```python
def swap(a: str, b: str):
    a = a + b
    b = a[:len(a) - len(b)]
    a = a[len(b):]
    return a, b
```
> A classic trick question. In Python, `a, b = b, a` is the real answer.

? Count uppercase, lowercase, digits and special characters | E
```java
public static int[] charTypes(String s) {
    int u = 0, l = 0, d = 0, o = 0;
    for (char c : s.toCharArray()) {
        if (Character.isUpperCase(c)) u++;
        else if (Character.isLowerCase(c)) l++;
        else if (Character.isDigit(c)) d++;
        else o++;
    }
    return new int[]{u, l, d, o};
}
```
```python
def char_types(s: str):
    u = sum(c.isupper() for c in s)
    l = sum(c.islower() for c in s)
    d = sum(c.isdigit() for c in s)
    return u, l, d, len(s) - u - l - d
```
> Useful for password policy validation tests.

? Validate a password policy | M
```java
public static boolean validPassword(String p) {
    return p.length() >= 8
        && p.chars().anyMatch(Character::isUpperCase)
        && p.chars().anyMatch(Character::isLowerCase)
        && p.chars().anyMatch(Character::isDigit)
        && p.chars().anyMatch(c -> !Character.isLetterOrDigit(c))
        && !p.contains(" ");
}
```
```python
def valid_password(p: str) -> bool:
    return (len(p) >= 8 and any(c.isupper() for c in p)
            and any(c.islower() for c in p) and any(c.isdigit() for c in p)
            and any(not c.isalnum() for c in p) and " " not in p)
```
> Then list the test data you'd use: each rule failing alone, boundary length 7/8.

? Validate an email address (basic) | E
```java
public static boolean validEmail(String e) {
    return e.matches("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)*\\.[A-Za-z]{2,}$");
}
```
```python
import re

def valid_email(e: str) -> bool:
    return re.fullmatch(r"[\w.+-]+@[\w-]+(\.[\w-]+)*\.[A-Za-z]{2,}", e) is not None
```
> Say that full RFC validation is complex; real systems confirm by sending a verification email.

? Capitalise the first letter of each word | E
```java
public static String titleCase(String s) {
    return Arrays.stream(s.trim().split("\\s+"))
        .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1).toLowerCase())
        .collect(Collectors.joining(" "));
}
```
```python
def title_case(s: str) -> str:
    return " ".join(w[:1].upper() + w[1:].lower() for w in s.split())
```
> `str.title()` exists in Python but mishandles apostrophes ("don'T").

? Find the most frequent character | E
```java
public static char mostFrequent(String s) {
    Map<Character, Integer> m = new HashMap<>();
    char best = s.charAt(0);
    for (char c : s.toCharArray()) {
        int n = m.merge(c, 1, Integer::sum);
        if (n > m.get(best)) best = c;
    }
    return best;
}
```
```python
from collections import Counter

def most_frequent(s: str) -> str:
    return Counter(s).most_common(1)[0][0]
```
> Ask about ties and whether spaces count.

? Check if a string is a pangram | E
```java
public static boolean isPangram(String s) {
    return s.toLowerCase().chars().filter(c -> c >= 'a' && c <= 'z').distinct().count() == 26;
}
```
```python
import string

def is_pangram(s: str) -> bool:
    return set(string.ascii_lowercase) <= set(s.lower())
```
> "The quick brown fox jumps over the lazy dog" → true.

? Group anagrams together | M
```java
public static Collection<List<String>> groupAnagrams(String[] words) {
    Map<String, List<String>> m = new LinkedHashMap<>();
    for (String w : words) {
        char[] k = w.toCharArray(); Arrays.sort(k);
        m.computeIfAbsent(new String(k), x -> new ArrayList<>()).add(w);
    }
    return m.values();
}
```
```python
from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        groups["".join(sorted(w))].append(w)
    return list(groups.values())
```
> Sorted letters are the key. O(n·k log k).

? Longest common prefix | M
```java
public static String commonPrefix(String[] a) {
    if (a.length == 0) return "";
    String p = a[0];
    for (String s : a) while (!s.startsWith(p)) p = p.substring(0, p.length() - 1);
    return p;
}
```
```python
import os

def common_prefix(a) -> str:
    return os.path.commonprefix(a) if a else ""
```
> Manual Python version: shrink the prefix like the Java one.

? String to integer without parseInt | M
```java
public static int toInt(String s) {
    s = s.trim();
    int i = 0, sign = 1; long n = 0;
    if (i < s.length() && (s.charAt(i) == '-' || s.charAt(i) == '+')) sign = s.charAt(i++) == '-' ? -1 : 1;
    while (i < s.length() && Character.isDigit(s.charAt(i))) {
        n = n * 10 + (s.charAt(i++) - '0');
        if (n * sign > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        if (n * sign < Integer.MIN_VALUE) return Integer.MIN_VALUE;
    }
    return (int) (n * sign);
}
```
```python
def to_int(s: str) -> int:
    s = s.strip(); i, sign, n = 0, 1, 0
    if i < len(s) and s[i] in "+-":
        sign = -1 if s[i] == "-" else 1; i += 1
    while i < len(s) and s[i].isdigit():
        n = n * 10 + int(s[i]); i += 1
    return max(-2**31, min(sign * n, 2**31 - 1))
```
> Discuss whitespace, sign, non-digits and overflow: those are the test cases.

? Check balanced brackets with other characters present | E
```java
public static boolean balanced(String s) {
    Deque<Character> st = new ArrayDeque<>();
    for (char c : s.toCharArray()) {
        if ("([{".indexOf(c) >= 0) st.push(c);
        else if (")]}".indexOf(c) >= 0) {
            if (st.isEmpty() || "([{".indexOf(st.pop()) != ")]}".indexOf(c)) return false;
        }
    }
    return st.isEmpty();
}
```
```python
def balanced(s: str) -> bool:
    pairs, stack = {")": "(", "]": "[", "}": "{"}, []
    for c in s:
        if c in "([{":
            stack.append(c)
        elif c in pairs and (not stack or stack.pop() != pairs[c]):
            return False
    return not stack
```
> Same idea as valid parentheses but ignores other characters, e.g. JSON or code snippets.

? Find all permutations of a string | H
```java
public static List<String> permutations(String s) {
    List<String> out = new ArrayList<>();
    permute("", s, out);
    return out;
}
private static void permute(String prefix, String rest, List<String> out) {
    if (rest.isEmpty()) { out.add(prefix); return; }
    for (int i = 0; i < rest.length(); i++)
        permute(prefix + rest.charAt(i), rest.substring(0, i) + rest.substring(i + 1), out);
}
```
```python
def permutations(s: str):
    if len(s) <= 1:
        return [s]
    return [c + p for i, c in enumerate(s) for p in permutations(s[:i] + s[i + 1:])]
```
> n! results; mention `itertools.permutations` exists.

? Remove all whitespace from a string | E
```java
public static String noSpaces(String s) {
    return s.replaceAll("\\s+", "");
}
```
```python
def no_spaces(s: str) -> str:
    return "".join(s.split())
```
> Common when comparing UI text with expected values.

? Find the first repeating character | E
```java
public static Character firstRepeat(String s) {
    Set<Character> seen = new HashSet<>();
    for (char c : s.toCharArray()) if (!seen.add(c)) return c;
    return null;
}
```
```python
def first_repeat(s: str):
    seen = set()
    for c in s:
        if c in seen:
            return c
        seen.add(c)
    return None
```
> Different from first non-repeating; clarify which one is asked.

? Count occurrences of a substring | E
```java
public static int countSub(String s, String sub) {
    int count = 0, i = 0;
    while ((i = s.indexOf(sub, i)) != -1) { count++; i += sub.length(); }
    return count;
}
```
```python
def count_sub(s: str, sub: str) -> int:
    return s.count(sub)
```
> Non-overlapping count. For overlapping matches move `i` by 1.

# group: Arrays and numbers
? Find the largest and smallest element | E
```java
public static int[] minMax(int[] a) {
    int min = a[0], max = a[0];
    for (int x : a) { min = Math.min(min, x); max = Math.max(max, x); }
    return new int[]{min, max};
}
```
```python
def min_max(a):
    return min(a), max(a)
```
> One pass without sorting.

? Reverse an array in place | E
```java
public static void reverse(int[] a) {
    for (int i = 0, j = a.length - 1; i < j; i++, j--) {
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
}
```
```python
def reverse(a) -> None:
    i, j = 0, len(a) - 1
    while i < j:
        a[i], a[j] = a[j], a[i]
        i += 1; j -= 1
```
> Two pointers. `a.reverse()` is the built-in.

? Sort an array without built-in sort (bubble sort) | E
```java
public static void bubbleSort(int[] a) {
    for (int i = 0; i < a.length - 1; i++) {
        boolean swapped = false;
        for (int j = 0; j < a.length - 1 - i; j++)
            if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; swapped = true; }
        if (!swapped) break;
    }
}
```
```python
def bubble_sort(a) -> None:
    for i in range(len(a) - 1):
        swapped = False
        for j in range(len(a) - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]; swapped = True
        if not swapped:
            break
```
> O(n²); the early exit makes it O(n) on sorted input. Mention merge sort for O(n log n).

? Binary search | E
```java
public static int binarySearch(int[] a, int target) {
    int lo = 0, hi = a.length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}
```
```python
def binary_search(a, target) -> int:
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
```
> `lo + (hi - lo) / 2` avoids integer overflow in Java.

? Merge two sorted arrays | E
```java
public static int[] merge(int[] a, int[] b) {
    int[] r = new int[a.length + b.length];
    int i = 0, j = 0, k = 0;
    while (i < a.length && j < b.length) r[k++] = a[i] <= b[j] ? a[i++] : b[j++];
    while (i < a.length) r[k++] = a[i++];
    while (j < b.length) r[k++] = b[j++];
    return r;
}
```
```python
def merge(a, b):
    i = j = 0; r = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            r.append(a[i]); i += 1
        else:
            r.append(b[j]); j += 1
    return r + a[i:] + b[j:]
```
> O(n + m). This is the core of merge sort.

? Remove duplicates from a sorted array in place | E
```java
public static int dedupeSorted(int[] a) {
    if (a.length == 0) return 0;
    int k = 1;
    for (int i = 1; i < a.length; i++) if (a[i] != a[k - 1]) a[k++] = a[i];
    return k;
}
```
```python
def dedupe_sorted(a) -> int:
    if not a:
        return 0
    k = 1
    for i in range(1, len(a)):
        if a[i] != a[k - 1]:
            a[k] = a[i]; k += 1
    return k
```
> Returns the new length; first k elements are unique.

? Rotate an array by k positions | M
```java
public static void rotate(int[] a, int k) {
    k %= a.length;
    rev(a, 0, a.length - 1); rev(a, 0, k - 1); rev(a, k, a.length - 1);
}
private static void rev(int[] a, int i, int j) {
    while (i < j) { int t = a[i]; a[i++] = a[j]; a[j--] = t; }
}
```
```python
def rotate(a, k) -> None:
    k %= len(a)
    a[:] = a[-k:] + a[:-k] if k else a
```
> Right rotation. The three-reversal trick is O(n) time and O(1) space.

? Find the intersection of two arrays | E
```java
public static Set<Integer> intersection(int[] a, int[] b) {
    Set<Integer> sa = new HashSet<>(), out = new LinkedHashSet<>();
    for (int x : a) sa.add(x);
    for (int x : b) if (sa.contains(x)) out.add(x);
    return out;
}
```
```python
def intersection(a, b):
    return list(dict.fromkeys(x for x in b if x in set(a)))
```
> Sets give O(n + m). Clarify whether duplicates should repeat.

? Find pairs that sum to a target | M
```java
public static List<int[]> pairs(int[] a, int target) {
    Set<Integer> seen = new HashSet<>();
    List<int[]> out = new ArrayList<>();
    for (int x : a) {
        if (seen.contains(target - x)) out.add(new int[]{target - x, x});
        seen.add(x);
    }
    return out;
}
```
```python
def pairs(a, target):
    seen, out = set(), []
    for x in a:
        if target - x in seen:
            out.append((target - x, x))
        seen.add(x)
    return out
```
> Like Two Sum but returns all pairs.

? Maximum subarray sum (Kadane's algorithm) | M
```java
public static int maxSubarray(int[] a) {
    int best = a[0], cur = a[0];
    for (int i = 1; i < a.length; i++) {
        cur = Math.max(a[i], cur + a[i]);
        best = Math.max(best, cur);
    }
    return best;
}
```
```python
def max_subarray(a) -> int:
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best
```
> O(n). Works when all numbers are negative.

? Best time to buy and sell a stock | E
```java
public static int maxProfit(int[] prices) {
    int min = Integer.MAX_VALUE, best = 0;
    for (int p : prices) { min = Math.min(min, p); best = Math.max(best, p - min); }
    return best;
}
```
```python
def max_profit(prices) -> int:
    lo, best = float("inf"), 0
    for p in prices:
        lo = min(lo, p)
        best = max(best, p - lo)
    return best
```
> Track the lowest price so far. O(n).

? Product of array except self | M
```java
public static int[] productExceptSelf(int[] a) {
    int n = a.length; int[] r = new int[n];
    r[0] = 1;
    for (int i = 1; i < n; i++) r[i] = r[i - 1] * a[i - 1];
    int right = 1;
    for (int i = n - 1; i >= 0; i--) { r[i] *= right; right *= a[i]; }
    return r;
}
```
```python
def product_except_self(a):
    n = len(a); r = [1] * n
    for i in range(1, n):
        r[i] = r[i - 1] * a[i - 1]
    right = 1
    for i in range(n - 1, -1, -1):
        r[i] *= right; right *= a[i]
    return r
```
> Prefix and suffix products, no division. O(n).

? Find the majority element | M
```java
public static int majority(int[] a) {
    int cand = 0, count = 0;
    for (int x : a) {
        if (count == 0) cand = x;
        count += (x == cand) ? 1 : -1;
    }
    return cand;
}
```
```python
def majority(a) -> int:
    cand, count = None, 0
    for x in a:
        if count == 0:
            cand = x
        count += 1 if x == cand else -1
    return cand
```
> Boyer-Moore voting, O(1) space. Assumes a majority (> n/2) exists.

? Sort 0s, 1s and 2s (Dutch national flag) | M
```java
public static void sort012(int[] a) {
    int lo = 0, mid = 0, hi = a.length - 1;
    while (mid <= hi) {
        if (a[mid] == 0) { int t = a[lo]; a[lo++] = a[mid]; a[mid++] = t; }
        else if (a[mid] == 1) mid++;
        else { int t = a[hi]; a[hi--] = a[mid]; a[mid] = t; }
    }
}
```
```python
def sort012(a) -> None:
    lo = mid = 0; hi = len(a) - 1
    while mid <= hi:
        if a[mid] == 0:
            a[lo], a[mid] = a[mid], a[lo]; lo += 1; mid += 1
        elif a[mid] == 1:
            mid += 1
        else:
            a[mid], a[hi] = a[hi], a[mid]; hi -= 1
```
> One pass, three pointers.

? Find the kth largest element | M
```java
public static int kthLargest(int[] a, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();
    for (int x : a) { heap.offer(x); if (heap.size() > k) heap.poll(); }
    return heap.peek();
}
```
```python
import heapq

def kth_largest(a, k) -> int:
    return heapq.nlargest(k, a)[-1]
```
> Min-heap of size k: O(n log k).

? Find the missing and repeating number | M
```java
public static int[] missingAndRepeat(int[] a) {
    int n = a.length; boolean[] seen = new boolean[n + 1]; int rep = -1;
    for (int x : a) { if (seen[x]) rep = x; seen[x] = true; }
    for (int i = 1; i <= n; i++) if (!seen[i]) return new int[]{i, rep};
    return new int[]{-1, rep};
}
```
```python
def missing_and_repeat(a):
    n = len(a); seen = set(); rep = None
    for x in a:
        if x in seen:
            rep = x
        seen.add(x)
    missing = next(i for i in range(1, n + 1) if i not in seen)
    return missing, rep
```
> Numbers are 1..n with one missing and one duplicated.

? Count frequency of each element in an array | E
```java
public static Map<Integer, Long> frequency(int[] a) {
    return Arrays.stream(a).boxed()
        .collect(Collectors.groupingBy(x -> x, LinkedHashMap::new, Collectors.counting()));
}
```
```python
from collections import Counter

def frequency(a):
    return dict(Counter(a))
```
> Streams version shows Java 8 knowledge; a loop with `merge` is fine too.

? Find the longest consecutive sequence | H
```java
public static int longestConsecutive(int[] a) {
    Set<Integer> s = new HashSet<>();
    for (int x : a) s.add(x);
    int best = 0;
    for (int x : s) {
        if (s.contains(x - 1)) continue;
        int len = 1;
        while (s.contains(x + len)) len++;
        best = Math.max(best, len);
    }
    return best;
}
```
```python
def longest_consecutive(a) -> int:
    s, best = set(a), 0
    for x in s:
        if x - 1 not in s:
            n = 1
            while x + n in s:
                n += 1
            best = max(best, n)
    return best
```
> Start counting only at sequence starts: O(n).

? Merge overlapping intervals | M
```java
public static List<int[]> mergeIntervals(int[][] in) {
    Arrays.sort(in, Comparator.comparingInt(x -> x[0]));
    List<int[]> out = new ArrayList<>();
    for (int[] cur : in) {
        if (out.isEmpty() || out.get(out.size() - 1)[1] < cur[0]) out.add(cur.clone());
        else out.get(out.size() - 1)[1] = Math.max(out.get(out.size() - 1)[1], cur[1]);
    }
    return out;
}
```
```python
def merge_intervals(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and out[-1][1] >= s:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out
```
> Real-world use: merging booking slots or maintenance windows.

? Find the equilibrium index | M
```java
public static int equilibrium(int[] a) {
    long total = 0, left = 0;
    for (int x : a) total += x;
    for (int i = 0; i < a.length; i++) {
        if (left == total - left - a[i]) return i;
        left += a[i];
    }
    return -1;
}
```
```python
def equilibrium(a) -> int:
    total, left = sum(a), 0
    for i, x in enumerate(a):
        if left == total - left - x:
            return i
        left += x
    return -1
```
> Index where the sum of the left side equals the sum of the right side.

? Container with most water | M
```java
public static int maxArea(int[] h) {
    int i = 0, j = h.length - 1, best = 0;
    while (i < j) {
        best = Math.max(best, Math.min(h[i], h[j]) * (j - i));
        if (h[i] < h[j]) i++; else j--;
    }
    return best;
}
```
```python
def max_area(h) -> int:
    i, j, best = 0, len(h) - 1, 0
    while i < j:
        best = max(best, min(h[i], h[j]) * (j - i))
        if h[i] < h[j]:
            i += 1
        else:
            j -= 1
    return best
```
> Two pointers: always move the shorter wall.

? Three sum: triplets that add to zero | H
```java
public static List<List<Integer>> threeSum(int[] a) {
    Arrays.sort(a);
    List<List<Integer>> out = new ArrayList<>();
    for (int i = 0; i < a.length - 2; i++) {
        if (i > 0 && a[i] == a[i - 1]) continue;
        int l = i + 1, r = a.length - 1;
        while (l < r) {
            int s = a[i] + a[l] + a[r];
            if (s == 0) {
                out.add(List.of(a[i], a[l], a[r]));
                while (l < r && a[l] == a[l + 1]) l++;
                l++; r--;
            } else if (s < 0) l++; else r--;
        }
    }
    return out;
}
```
```python
def three_sum(a):
    a = sorted(a); out = []
    for i in range(len(a) - 2):
        if i and a[i] == a[i - 1]:
            continue
        l, r = i + 1, len(a) - 1
        while l < r:
            s = a[i] + a[l] + a[r]
            if s == 0:
                out.append([a[i], a[l], a[r]])
                while l < r and a[l] == a[l + 1]:
                    l += 1
                l += 1; r -= 1
            elif s < 0:
                l += 1
            else:
                r -= 1
    return out
```
> Sort, then two pointers per element. O(n²); skip duplicates.

? Subarray with a given sum (positive numbers) | M
```java
public static int[] subarraySum(int[] a, int target) {
    int start = 0, sum = 0;
    for (int end = 0; end < a.length; end++) {
        sum += a[end];
        while (sum > target && start < end) sum -= a[start++];
        if (sum == target) return new int[]{start, end};
    }
    return new int[]{-1, -1};
}
```
```python
def subarray_sum(a, target):
    start = total = 0
    for end, x in enumerate(a):
        total += x
        while total > target and start < end:
            total -= a[start]; start += 1
        if total == target:
            return start, end
    return -1, -1
```
> Sliding window works only for non-negative numbers; use prefix sums with a HashMap otherwise.

# group: Math and logic
? FizzBuzz | E
```java
public static List<String> fizzBuzz(int n) {
    List<String> out = new ArrayList<>();
    for (int i = 1; i <= n; i++)
        out.add(i % 15 == 0 ? "FizzBuzz" : i % 3 == 0 ? "Fizz" : i % 5 == 0 ? "Buzz" : String.valueOf(i));
    return out;
}
```
```python
def fizz_buzz(n):
    return ["FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else str(i)
            for i in range(1, n + 1)]
```
> Check 15 first. Still asked as a warm-up.

? Check if a number is prime | E
```java
public static boolean isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; (long) i * i <= n; i++) if (n % i == 0) return false;
    return true;
}
```
```python
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    i = 2
    while i * i <= n:
        if n % i == 0:
            return False
        i += 1
    return True
```
> Only check up to √n.

? Print primes up to n (Sieve of Eratosthenes) | M
```java
public static List<Integer> primesUpTo(int n) {
    boolean[] comp = new boolean[n + 1];
    List<Integer> out = new ArrayList<>();
    for (int i = 2; i <= n; i++) {
        if (comp[i]) continue;
        out.add(i);
        for (long j = (long) i * i; j <= n; j += i) comp[(int) j] = true;
    }
    return out;
}
```
```python
def primes_up_to(n):
    comp = [False] * (n + 1); out = []
    for i in range(2, n + 1):
        if not comp[i]:
            out.append(i)
            for j in range(i * i, n + 1, i):
                comp[j] = True
    return out
```
> O(n log log n).

? Fibonacci series (iterative) | E
```java
public static List<Long> fibonacci(int n) {
    List<Long> out = new ArrayList<>();
    long a = 0, b = 1;
    for (int i = 0; i < n; i++) { out.add(a); long t = a + b; a = b; b = t; }
    return out;
}
```
```python
def fibonacci(n):
    out, a, b = [], 0, 1
    for _ in range(n):
        out.append(a); a, b = b, a + b
    return out
```
> Mention that naive recursion is O(2ⁿ); memoisation or iteration fixes it.

? Factorial (iterative and recursive) | E
```java
public static long factorial(int n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}
```
```python
def factorial(n: int) -> int:
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
```
> `long` overflows after 20!; use `BigInteger` for larger values.

? Reverse a number | E
```java
public static int reverseNumber(int n) {
    int r = 0;
    while (n != 0) { r = r * 10 + n % 10; n /= 10; }
    return r;
}
```
```python
def reverse_number(n: int) -> int:
    sign = -1 if n < 0 else 1
    return sign * int(str(abs(n))[::-1])
```
> Works for negatives in Java because `%` keeps the sign.

? Check if a number is a palindrome | E
```java
public static boolean isPalindromeNumber(int n) {
    if (n < 0) return false;
    int r = 0, x = n;
    while (x > 0) { r = r * 10 + x % 10; x /= 10; }
    return r == n;
}
```
```python
def is_palindrome_number(n: int) -> bool:
    return n >= 0 and str(n) == str(n)[::-1]
```
> 121 → true, -121 → false.

? Armstrong number | E
```java
public static boolean isArmstrong(int n) {
    String s = String.valueOf(n); int p = s.length(), sum = 0;
    for (char c : s.toCharArray()) sum += (int) Math.pow(c - '0', p);
    return sum == n;
}
```
```python
def is_armstrong(n: int) -> bool:
    s = str(n)
    return n == sum(int(d) ** len(s) for d in s)
```
> 153 = 1³ + 5³ + 3³.

? Sum of digits | E
```java
public static int digitSum(int n) {
    int s = 0; n = Math.abs(n);
    while (n > 0) { s += n % 10; n /= 10; }
    return s;
}
```
```python
def digit_sum(n: int) -> int:
    return sum(int(d) for d in str(abs(n)))
```
> Follow-up: repeat until a single digit (digital root).

? GCD and LCM | E
```java
public static int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
public static long lcm(int a, int b) { return (long) a / gcd(a, b) * b; }
```
```python
def gcd(a: int, b: int) -> int:
    while b:
        a, b = b, a % b
    return a

def lcm(a: int, b: int) -> int:
    return a // gcd(a, b) * b
```
> Euclid's algorithm. Divide before multiplying to avoid overflow.

? Swap two numbers without a temp variable | E
```java
public static int[] swapNums(int a, int b) {
    a = a ^ b; b = a ^ b; a = a ^ b;
    return new int[]{a, b};
}
```
```python
def swap_nums(a: int, b: int):
    a = a + b; b = a - b; a = a - b
    return a, b
```
> XOR avoids overflow; the sum trick can overflow in Java.

? Count set bits in an integer | M
```java
public static int countBits(int n) {
    int c = 0;
    while (n != 0) { n &= n - 1; c++; }
    return c;
}
```
```python
def count_bits(n: int) -> int:
    return bin(n).count("1")
```
> `n & (n - 1)` clears the lowest set bit. `Integer.bitCount` is the built-in.

? Check if a number is a power of two | E
```java
public static boolean isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}
```
```python
def is_power_of_two(n: int) -> bool:
    return n > 0 and n & (n - 1) == 0
```
> A power of two has exactly one set bit.

? Convert decimal to binary without built-ins | E
```java
public static String toBinary(int n) {
    if (n == 0) return "0";
    StringBuilder sb = new StringBuilder();
    while (n > 0) { sb.append(n % 2); n /= 2; }
    return sb.reverse().toString();
}
```
```python
def to_binary(n: int) -> str:
    if n == 0:
        return "0"
    bits = []
    while n:
        bits.append(str(n % 2)); n //= 2
    return "".join(reversed(bits))
```
> Built-ins: `Integer.toBinaryString(n)`, `bin(n)[2:]`.

? Print a right-angled star pattern | E
```java
public static String stars(int n) {
    StringBuilder sb = new StringBuilder();
    for (int i = 1; i <= n; i++) sb.append("*".repeat(i)).append('\n');
    return sb.toString();
}
```
```python
def stars(n: int) -> str:
    return "".join("*" * i + "\n" for i in range(1, n + 1))
```
> Pattern questions still appear in service-company rounds; know pyramids and diamonds too.

? Leap year check | E
```java
public static boolean isLeap(int y) {
    return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
}
```
```python
def is_leap(y: int) -> bool:
    return (y % 4 == 0 and y % 100 != 0) or y % 400 == 0
```
> 1900 is not a leap year, 2000 is. Great boundary test data.

# group: Data structures
? Implement a stack using an array | M
```java
public static class IntStack {
    private int[] data = new int[4]; private int size;
    public void push(int x) {
        if (size == data.length) data = Arrays.copyOf(data, size * 2);
        data[size++] = x;
    }
    public int pop() {
        if (size == 0) throw new IllegalStateException("empty");
        return data[--size];
    }
    public int peek() { return data[size - 1]; }
    public boolean isEmpty() { return size == 0; }
}
```
```python
class IntStack:
    def __init__(self):
        self._data = []
    def push(self, x):
        self._data.append(x)
    def pop(self):
        if not self._data:
            raise IndexError("empty")
        return self._data.pop()
    def peek(self):
        return self._data[-1]
    def is_empty(self):
        return not self._data
```
> Mention amortised O(1) push with doubling.

? Implement a queue using two stacks | M
```java
public static class StackQueue {
    private final Deque<Integer> in = new ArrayDeque<>(), out = new ArrayDeque<>();
    public void enqueue(int x) { in.push(x); }
    public int dequeue() {
        if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());
        return out.pop();
    }
}
```
```python
class StackQueue:
    def __init__(self):
        self._in, self._out = [], []
    def enqueue(self, x):
        self._in.append(x)
    def dequeue(self):
        if not self._out:
            while self._in:
                self._out.append(self._in.pop())
        return self._out.pop()
```
> Amortised O(1) per operation.

? Reverse a linked list | M
```java
public static class Node { int val; Node next; Node(int v) { val = v; } }
public static Node reverseList(Node head) {
    Node prev = null;
    while (head != null) { Node next = head.next; head.next = prev; prev = head; head = next; }
    return prev;
}
```
```python
class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def reverse_list(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev
```
> Iterative, O(1) space. Be ready to draw the pointer changes.

? Find the middle of a linked list | E
```java
public static class ListNode { int val; ListNode next; ListNode(int v) { val = v; } }
public static ListNode middle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; }
    return slow;
}
```
```python
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow
```
> Fast and slow pointers.

? Detect a cycle in a linked list | M
```java
public static class CNode { int val; CNode next; CNode(int v) { val = v; } }
public static boolean hasCycle(CNode head) {
    CNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next; fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}
```
```python
def has_cycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            return True
    return False
```
> Floyd's tortoise and hare, O(1) space.

? Implement an LRU cache | H
```java
public static class LRU<K, V> extends LinkedHashMap<K, V> {
    private final int cap;
    public LRU(int cap) { super(16, 0.75f, true); this.cap = cap; }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) { return size() > cap; }
}
```
```python
from collections import OrderedDict

class LRU:
    def __init__(self, cap):
        self.cap, self.d = cap, OrderedDict()
    def get(self, k):
        if k not in self.d:
            return None
        self.d.move_to_end(k)
        return self.d[k]
    def put(self, k, v):
        self.d[k] = v; self.d.move_to_end(k)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)
```
> `LinkedHashMap` with access order is the idiomatic Java answer; be ready to build it with a HashMap + doubly linked list.

? Find the first non-repeating element in a stream | M
```java
public static class FirstUnique {
    private final Map<Integer, Integer> count = new HashMap<>();
    private final Deque<Integer> q = new ArrayDeque<>();
    public void add(int x) { if (count.merge(x, 1, Integer::sum) == 1) q.add(x); }
    public Integer first() {
        while (!q.isEmpty() && count.get(q.peek()) > 1) q.poll();
        return q.peek();
    }
}
```
```python
from collections import Counter, deque

class FirstUnique:
    def __init__(self):
        self.count, self.q = Counter(), deque()
    def add(self, x):
        self.count[x] += 1
        if self.count[x] == 1:
            self.q.append(x)
    def first(self):
        while self.q and self.count[self.q[0]] > 1:
            self.q.popleft()
        return self.q[0] if self.q else None
```
> Queue plus counts; amortised O(1).

? Top K frequent elements | M
```java
public static List<Integer> topK(int[] a, int k) {
    Map<Integer, Integer> c = new HashMap<>();
    for (int x : a) c.merge(x, 1, Integer::sum);
    return c.entrySet().stream()
        .sorted((x, y) -> y.getValue() - x.getValue())
        .limit(k).map(Map.Entry::getKey).collect(Collectors.toList());
}
```
```python
from collections import Counter

def top_k(a, k):
    return [x for x, _ in Counter(a).most_common(k)]
```
> Heap-based O(n log k) is the optimisation to mention.

? Matrix transpose | E
```java
public static int[][] transpose(int[][] m) {
    int[][] t = new int[m[0].length][m.length];
    for (int i = 0; i < m.length; i++)
        for (int j = 0; j < m[0].length; j++) t[j][i] = m[i][j];
    return t;
}
```
```python
def transpose(m):
    return [list(row) for row in zip(*m)]
```
> Works for non-square matrices too.

? Rotate a matrix 90 degrees clockwise | M
```java
public static void rotate90(int[][] m) {
    int n = m.length;
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++) { int t = m[i][j]; m[i][j] = m[j][i]; m[j][i] = t; }
    for (int[] row : m)
        for (int i = 0, j = n - 1; i < j; i++, j--) { int t = row[i]; row[i] = row[j]; row[j] = t; }
}
```
```python
def rotate90(m) -> None:
    m[:] = [list(row)[::-1] for row in zip(*m)]
```
> Transpose then reverse each row.

? Spiral order of a matrix | H
```java
public static List<Integer> spiral(int[][] m) {
    List<Integer> out = new ArrayList<>();
    int top = 0, bottom = m.length - 1, left = 0, right = m[0].length - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) out.add(m[top][j]);
        top++;
        for (int i = top; i <= bottom; i++) out.add(m[i][right]);
        right--;
        if (top <= bottom) { for (int j = right; j >= left; j--) out.add(m[bottom][j]); bottom--; }
        if (left <= right) { for (int i = bottom; i >= top; i--) out.add(m[i][left]); left++; }
    }
    return out;
}
```
```python
def spiral(m):
    out = []
    while m:
        out += m.pop(0)
        m = [list(r) for r in zip(*m)][::-1]
    return out
```
> Boundary pointers in Java; the Python rotate trick is a nice one-liner to explain.

# group: Automation coding
? Validate a JSON API response against expected fields | M | recent
```java
public static List<String> missingFields(Map<String, Object> json, List<String> required) {
    List<String> missing = new ArrayList<>();
    for (String path : required) {
        Object cur = json;
        for (String key : path.split("\\.")) {
            cur = (cur instanceof Map<?, ?> m) ? m.get(key) : null;
        }
        if (cur == null) missing.add(path);
    }
    return missing;
}
```
```python
def missing_fields(data: dict, required):
    missing = []
    for path in required:
        cur = data
        for key in path.split("."):
            cur = cur.get(key) if isinstance(cur, dict) else None
        if cur is None:
            missing.append(path)
    return missing
```
> 2026 SDET rounds favour practical tasks like this over puzzles. `missingFields(resp, List.of("user.id", "user.address.city"))`.

? Parse a log file and count errors per type | M | recent
```java
public static Map<String, Long> errorCounts(List<String> lines) {
    Pattern p = Pattern.compile("ERROR\\s+\\[(\\w+)\\]");
    return lines.stream().map(p::matcher).filter(Matcher::find)
        .collect(Collectors.groupingBy(m -> m.group(1), TreeMap::new, Collectors.counting()));
}
```
```python
import re
from collections import Counter

def error_counts(lines):
    p = re.compile(r"ERROR\s+\[(\w+)\]")
    return dict(sorted(Counter(m.group(1) for l in lines if (m := p.search(l))).items()))
```
> Input lines like `2026-03-01 10:00:01 ERROR [PaymentService] timeout`. Talk about streaming large files line by line.

? Retry a flaky operation with exponential backoff | M | recent
```java
public static <T> T retry(Supplier<T> op, int attempts, long baseMs) throws InterruptedException {
    RuntimeException last = null;
    for (int i = 0; i < attempts; i++) {
        try { return op.get(); }
        catch (RuntimeException e) { last = e; Thread.sleep(baseMs * (1L << i)); }
    }
    throw last;
}
```
```python
import time

def retry(op, attempts=3, base=0.2):
    last = None
    for i in range(attempts):
        try:
            return op()
        except Exception as e:
            last = e
            time.sleep(base * 2 ** i)
    raise last
```
> Explain when retries are acceptable (transient infra errors) and when they hide real bugs.

? Compare two JSON objects and list differences | H | recent
```java
public static List<String> diff(Object a, Object b, String path) {
    List<String> out = new ArrayList<>();
    if (a instanceof Map<?, ?> ma && b instanceof Map<?, ?> mb) {
        Set<Object> keys = new TreeSet<>(Comparator.comparing(Object::toString));
        keys.addAll(ma.keySet()); keys.addAll(mb.keySet());
        for (Object k : keys) out.addAll(diff(ma.get(k), mb.get(k), path + "." + k));
    } else if (!Objects.equals(a, b)) {
        out.add(path + ": " + a + " != " + b);
    }
    return out;
}
```
```python
def diff(a, b, path=""):
    if isinstance(a, dict) and isinstance(b, dict):
        out = []
        for k in sorted(set(a) | set(b)):
            out += diff(a.get(k), b.get(k), f"{path}.{k}")
        return out
    return [] if a == b else [f"{path}: {a!r} != {b!r}"]
```
> Recursive comparison; extend for lists and ignored keys (timestamps, IDs).

? Check if a list of URLs return 200 (concurrently) | H | recent
```java
public static Map<String, Integer> statuses(List<String> urls) throws Exception {
    HttpClient http = HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(5)).build();
    Map<String, Integer> out = new java.util.concurrent.ConcurrentHashMap<>();
    try (var pool = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
        for (String u : urls) pool.submit(() -> {
            try {
                var req = java.net.http.HttpRequest.newBuilder(java.net.URI.create(u)).GET().build();
                out.put(u, http.send(req, java.net.http.HttpResponse.BodyHandlers.discarding()).statusCode());
            } catch (Exception e) { out.put(u, -1); }
            return null;
        });
    }
    return out;
}
```
```python
from concurrent.futures import ThreadPoolExecutor
import urllib.request

def statuses(urls):
    def check(u):
        try:
            with urllib.request.urlopen(u, timeout=5) as r:
                return u, r.status
        except Exception:
            return u, -1
    with ThreadPoolExecutor(max_workers=16) as pool:
        return dict(pool.map(check, urls))
```
> Uses Java 21 virtual threads. Mention handling redirects and rate limits.

? Mask sensitive data in logs | M | recent
```java
public static String mask(String log) {
    return log.replaceAll("\\b(\\d{4})\\d{8}(\\d{4})\\b", "$1********$2")
              .replaceAll("(?i)(\"password\"\\s*:\\s*\")[^\"]*\"", "$1****\"")
              .replaceAll("(?i)(Bearer\\s+)[\\w.-]+", "$1****");
}
```
```python
import re

def mask(log: str) -> str:
    log = re.sub(r"\b(\d{4})\d{8}(\d{4})\b", r"\1********\2", log)
    log = re.sub(r'(?i)("password"\s*:\s*")[^"]*"', r'\1****"', log)
    return re.sub(r"(?i)(Bearer\s+)[\w.-]+", r"\1****", log)
```
> Card numbers, passwords and tokens. Test it with sample log lines.

? Generate unique test emails | E
```java
public static String testEmail(String prefix) {
    return prefix + "+" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6) + "@example.com";
}
```
```python
import time, uuid

def test_email(prefix: str) -> str:
    return f"{prefix}+{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}@example.com"
```
> Plus-addressing keeps mail in one test inbox while keeping addresses unique for parallel runs.

? Implement a simple rate limiter (token bucket) | H | recent
```java
public static class TokenBucket {
    private final long capacity; private final double refillPerMs;
    private double tokens; private long last = System.currentTimeMillis();
    public TokenBucket(long capacity, double perSecond) {
        this.capacity = capacity; this.refillPerMs = perSecond / 1000.0; this.tokens = capacity;
    }
    public synchronized boolean tryAcquire() {
        long now = System.currentTimeMillis();
        tokens = Math.min(capacity, tokens + (now - last) * refillPerMs); last = now;
        if (tokens >= 1) { tokens -= 1; return true; }
        return false;
    }
}
```
```python
import time

class TokenBucket:
    def __init__(self, capacity, per_second):
        self.capacity, self.rate = capacity, per_second
        self.tokens, self.last = capacity, time.monotonic()
    def try_acquire(self) -> bool:
        now = time.monotonic()
        self.tokens = min(self.capacity, self.tokens + (now - self.last) * self.rate)
        self.last = now
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
```
> Useful for throttling test traffic to shared environments; also a design question.

? Wait until a condition is true (custom polling utility) | M
```java
public static boolean waitUntil(BooleanSupplier cond, long timeoutMs, long pollMs) throws InterruptedException {
    long end = System.currentTimeMillis() + timeoutMs;
    while (System.currentTimeMillis() < end) {
        if (cond.getAsBoolean()) return true;
        Thread.sleep(pollMs);
    }
    return cond.getAsBoolean();
}
```
```python
import time

def wait_until(cond, timeout=10.0, poll=0.5) -> bool:
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        if cond():
            return True
        time.sleep(poll)
    return cond()
```
> This is what WebDriverWait and Awaitility do internally.

? Read CSV into a list of maps | E
```java
public static List<Map<String, String>> readCsv(List<String> lines) {
    String[] header = lines.get(0).split(",");
    List<Map<String, String>> rows = new ArrayList<>();
    for (String line : lines.subList(1, lines.size())) {
        String[] v = line.split(",", -1);
        Map<String, String> row = new LinkedHashMap<>();
        for (int i = 0; i < header.length; i++) row.put(header[i].trim(), i < v.length ? v[i].trim() : "");
        rows.add(row);
    }
    return rows;
}
```
```python
import csv, io

def read_csv(text: str):
    return list(csv.DictReader(io.StringIO(text)))
```
> Mention that real CSVs need a parser (OpenCSV, commons-csv) for quoted commas.

? Find duplicate test case IDs across files | E
```java
public static Set<String> duplicateIds(List<String> ids) {
    Set<String> seen = new HashSet<>(), dup = new TreeSet<>();
    for (String id : ids) if (!seen.add(id.trim().toUpperCase())) dup.add(id.trim().toUpperCase());
    return dup;
}
```
```python
from collections import Counter

def duplicate_ids(ids):
    c = Counter(i.strip().upper() for i in ids)
    return sorted(k for k, v in c.items() if v > 1)
```
> A realistic warm-up: normalise before comparing.

? Sort test results by status then duration | E
```java
public record Result(String name, String status, long ms) {}
public static List<Result> sortResults(List<Result> rs) {
    List<String> order = List.of("FAILED", "BROKEN", "SKIPPED", "PASSED");
    return rs.stream().sorted(Comparator.comparingInt((Result r) -> order.indexOf(r.status()))
        .thenComparing(Result::ms, Comparator.reverseOrder())).toList();
}
```
```python
def sort_results(results):
    order = {"FAILED": 0, "BROKEN": 1, "SKIPPED": 2, "PASSED": 3}
    return sorted(results, key=lambda r: (order[r["status"]], -r["ms"]))
```
> Shows Comparator chaining and records.

? Flatten a nested JSON into dot-notation keys | M | recent
```java
public static Map<String, Object> flatten(Map<String, Object> m, String prefix) {
    Map<String, Object> out = new LinkedHashMap<>();
    for (var e : m.entrySet()) {
        String key = prefix.isEmpty() ? e.getKey() : prefix + "." + e.getKey();
        if (e.getValue() instanceof Map<?, ?> nested) {
            @SuppressWarnings("unchecked") Map<String, Object> n = (Map<String, Object>) nested;
            out.putAll(flatten(n, key));
        } else out.put(key, e.getValue());
    }
    return out;
}
```
```python
def flatten(d: dict, prefix=""):
    out = {}
    for k, v in d.items():
        key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            out.update(flatten(v, key))
        else:
            out[key] = v
    return out
```
> Handy for comparing API responses or writing them to CSV reports.

# group: Hard concepts
? Big-O notation: what interviewers expect you to state | M | concept
Big-O describes how time or memory grows with input size n. Common classes: O(1) hash lookup, O(log n) binary search, O(n) single pass, O(n log n) good sorting, O(n²) nested loops, O(2ⁿ) naive recursion. For every solution say time and space complexity, and mention a faster option if one exists (e.g. two-sum brute force O(n²) vs hash map O(n)).

? How to approach a live coding round step by step | M | concept
1. Repeat the problem and ask about inputs, edge cases and expected output.
2. Give a brute-force idea and its complexity.
3. Improve it (hashing, two pointers, sorting, sliding window, stack).
4. Write clean code with meaningful names.
5. Walk through an example and edge cases (empty, one element, duplicates, negatives).
6. State complexity and how you'd test it.

Thinking aloud matters as much as the final code.

? The patterns that solve most SDET coding questions | H | concept
- **Hash map/set**: counting, duplicates, two-sum, anagrams.
- **Two pointers**: reversing, palindromes, sorted pair sums, merging.
- **Sliding window**: longest substring, subarray sums.
- **Stack**: brackets, undo, next greater element.
- **Sorting + scan**: intervals, grouping.
- **Recursion/backtracking**: permutations, subsets.
- **Fast/slow pointers**: linked list middle and cycles.

Recognising the pattern is most of the solution.
